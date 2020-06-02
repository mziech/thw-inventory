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
package thw.inventory.web;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.util.MimeTypeUtils;
import org.springframework.util.StreamUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Slf4j
@RestController
public class PageController {

    private final Map<String, String> manifest;

    public PageController(ObjectMapper objectMapper) {
        Map<String, String> manifest;
        try {
            manifest = objectMapper.readValue(
                    new ClassPathResource("/static/dist/manifest.json").getInputStream(),
                    new TypeReference<>() {}
            );
        } catch (IOException e) {
            log.error("Failed to load frontend manifest, trying to fallback to developer mode", e);
            manifest = Map.of("main.js", "/dist/bundle.js");
        }
        this.manifest = manifest;
    }

    @GetMapping({"/", "/asset/**", "/assessment/**", "/import", "/current-user", "/user/**"})
    public void render(HttpServletRequest request, HttpServletResponse response) throws IOException {
        var page = StreamUtils.copyToString(
                new ClassPathResource("/templates/index.mustache").getInputStream(), StandardCharsets.UTF_8
        ).replace(
                "{{basePath}}", stripTrailingSlash(request.getContextPath())
        ).replace(
                "{{mainJs}}", manifest.get("main.js")
        );
        response.setContentType(MimeTypeUtils.TEXT_HTML_VALUE);
        response.setContentLength(page.length());
        try (var writer = response.getWriter()) {
            writer.print(page);
        }
    }

    private CharSequence stripTrailingSlash(String servletPath) {
        return servletPath.endsWith("/") ? servletPath.substring(0, servletPath.length() - 1) : servletPath;
    }

}
