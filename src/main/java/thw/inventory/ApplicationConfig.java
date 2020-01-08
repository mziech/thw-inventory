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

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.dataformat.csv.CsvMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.IOException;
import java.net.URL;

@Slf4j
@SpringBootConfiguration
@EnableJpaAuditing
@EnableGlobalMethodSecurity(securedEnabled = true, prePostEnabled = true)
public class ApplicationConfig {

    @Value("${static.path:}")
    String staticPathProperty;

    @Bean
    CsvMapper csvMapper() {
        return new CsvMapper();
    }

    @Bean
    ObjectMapper objectMapper() {
        var bean = new ObjectMapper();
        bean.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, SerializationFeature.WRITE_DATE_KEYS_AS_TIMESTAMPS);
        bean.enable(JsonGenerator.Feature.IGNORE_UNKNOWN);
        bean.registerModule(new JavaTimeModule());
        return bean;
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    @Bean
    WebMvcConfigurer webMvcConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addResourceHandlers(ResourceHandlerRegistry registry) {
                if (!staticPathProperty.isBlank()) {
                    log.info("Reading static resources from file-system: {}", staticPathProperty);
                    registry.addResourceHandler("/**")
                            .addResourceLocations(staticPathProperty)
                            .setCachePeriod(0);
                    return;
                }

                ClassPathResource index = new ClassPathResource("/static/ping");
                try {
                    URL url = index.getURL();
                    String path = url.toString();
                    String staticPath = path.substring(0, path.lastIndexOf('/') + 1);
                    log.info("Reading static resources from file-system URL: {}", staticPath);
                    registry.addResourceHandler("/**")
                            .addResourceLocations(staticPath)
                            .setCachePeriod(0);
                } catch (IOException e) {
                    log.info("Using static content from classpath with caching");
                    registry.addResourceHandler("/**")
                            .addResourceLocations("classpath:/static/")
                            .setCachePeriod(24 * 60 * 60);
                }

            }
        };
    }

}
