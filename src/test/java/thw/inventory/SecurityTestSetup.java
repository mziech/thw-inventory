/*
 * thw-inventory - An inventory query and assessment tool
 * Copyright © 2019 Marco Ziech (marco@ziech.net)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
package thw.inventory;

import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.DefaultCsrfToken;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;

import javax.annotation.PostConstruct;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;

@Component
public class SecurityTestSetup {

    private final TestRestTemplate testRestTemplate;

    private final AtomicReference<String> sessionId = new AtomicReference<>();

    private final AtomicReference<CsrfToken> csrf = new AtomicReference<>();

    public SecurityTestSetup(TestRestTemplate testRestTemplate) {
        this.testRestTemplate = testRestTemplate;
    }

    @PostConstruct
    public void init() {
        testRestTemplate.getRestTemplate().setInterceptors(List.of(
                (request, body, execution) -> {
                    if (request.getURI().getPath().startsWith("/test/")) {
                        return execution.execute(request, body);
                    }

                    if (sessionId.get() == null) {
                        var session = testRestTemplate.getForObject("/test/session", String.class);
                        sessionId.set(session);
                    }
                    if (sessionId.get() != null) {
                        request.getHeaders().add(HttpHeaders.COOKIE, "JSESSIONID=" + sessionId.get());
                    }


                    if (csrf.get() == null && !request.getURI().getPath().equals("/api/current-user")) {
                        var json = testRestTemplate.getForObject("/api/current-user", ObjectNode.class);
                        csrf.set(new DefaultCsrfToken(
                                json.path("csrfHeader").textValue(), "bogus",
                                json.path("csrfToken").textValue()));
                    }
                    if (csrf.get() != null) {
                        request.getHeaders().add(csrf.get().getHeaderName(), csrf.get().getToken());
                    }
                    return execution.execute(request, body);
                }
        ));
    }

    public void login() {
        sessionId.set(null);
        csrf.set(null);

        var prelogin = testRestTemplate.getForEntity("/login", String.class);
        sessionId.set(prelogin.getHeaders().get("Set-Cookie").stream()
                .filter(v -> v.startsWith("JSESSIONID="))
                .map(v -> v.substring(v.indexOf('=') + 1, v.indexOf(';')))
                .findFirst().orElseThrow());

        var formHeaders = new HttpHeaders();
        formHeaders.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        var form = new LinkedMultiValueMap<>();
        form.add("username", "admin");
        form.add("password", "changeit");
        form.add("_csrf", prelogin.getBody().replaceAll("(?ms).*<input [^>]*name=\"_csrf\"[^>]*value=\"([^\"]*)\".*", "$1"));

        var login = testRestTemplate.postForEntity("/login", new HttpEntity<>(form, formHeaders), String.class);

        Optional.ofNullable(login.getHeaders().get("Set-Cookie")).stream()
                .flatMap(Collection::stream)
                .filter(v -> v.startsWith("JSESSIONID="))
                .map(v -> v.substring(v.indexOf('=') + 1, v.indexOf(';')))
                .forEach(sessionId::set);

        var session = testRestTemplate.getForObject("/api/current-user", ObjectNode.class);
        csrf.set(new DefaultCsrfToken(
                session.path("csrfHeader").textValue(), "_csrf", session.path("csrfToken").textValue()));
    }
}
