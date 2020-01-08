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

import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;
import thw.inventory.domain.model.Note;
import thw.inventory.service.UserService;

import java.security.Principal;
import java.util.Collection;
import java.util.Collections;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
public class CurrentUserController {

    private final UserService userService;

    public CurrentUserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/api/current-user/assessments/{assessmentId}/notes/seen")
    public Page<Note> seenNotes(@PathVariable long assessmentId) {
        return null;
    }

    @GetMapping("/api/current-user")
    public Map<String, ?> currentUser(CsrfToken csrfToken, Principal principal) {
        return Map.of(
                "csrfHeader", csrfToken.getHeaderName(),
                "csrfToken", csrfToken.getToken(),
                "username", principal.getName(),
                "authorities", getAuthorities(principal)
        );
    }

    private Collection<String> getAuthorities(Principal principal) {
        if (principal instanceof Authentication) {
            return ((Authentication) principal).getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toSet());
        }
        return Collections.emptySet();
    }

    @PostMapping("/api/current-user/password")
    public void changePassword(Principal principal, @RequestBody ChangePasswordDto changePasswordDto) {
        userService.changePassword(principal.getName(), changePasswordDto);
    }

}
