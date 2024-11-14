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
package thw.inventory.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import thw.inventory.domain.model.User;
import thw.inventory.domain.repository.UserRepository;
import thw.inventory.web.ChangePasswordDto;

import java.io.IOException;
import java.util.List;
import java.util.Optional;


@Service
public class UserService implements UserDetailsService, AuditorAware<String> {

    private final UserRepository userRepository;

    private final ObjectMapper objectMapper;

    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, ObjectMapper objectMapper, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        var user = userRepository.findByUsername(username).orElseThrow(() -> new UsernameNotFoundException(username));

        var data = Optional.ofNullable(user.getData())
                .map(this::decodeData)
                .orElse(new User.Data(List.of()));

        return org.springframework.security.core.userdetails.User.withUsername(user.getUsername())
                .password(user.getPassword())
                .disabled(user.isDisabled())
                .roles(data.roles().toArray(new String[0]))
                .build();
    }

    private User.Data decodeData(String json) {
        try {
            return objectMapper.readValue(json, User.Data.class);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to decode user data: " + json, e);
        }
    }

    @Transactional
    public void changePassword(String username, ChangePasswordDto changePasswordDto) {
        var user = userRepository.findByUsername(username).orElseThrow(() -> new IllegalArgumentException("Unknown user: " + username));
        if (!passwordEncoder.matches(changePasswordDto.getOldPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Wrong old password");
        }

        user.setPassword(passwordEncoder.encode(changePasswordDto.getNewPassword()));
    }

    @Override
    public Optional<String> getCurrentAuditor() {
        return Optional.ofNullable(SecurityContextHolder.getContext())
                .map(SecurityContext::getAuthentication)
                .filter(Authentication::isAuthenticated)
                .map(Authentication::getPrincipal)
                .map(org.springframework.security.core.userdetails.User.class::cast)
                .map(org.springframework.security.core.userdetails.User::getUsername);
    }
}
