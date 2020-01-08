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
package thw.inventory.domain;

import org.hibernate.boot.MetadataSources;
import org.hibernate.boot.registry.StandardServiceRegistryBuilder;
import org.hibernate.tool.hbm2ddl.SchemaExport;
import org.hibernate.tool.schema.TargetType;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider;
import org.springframework.core.type.filter.AnnotationTypeFilter;

import javax.persistence.Entity;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.Map;

public class SchemaGenerator {


    public static void main(String[] args) {
        Map<String, String> settings = new HashMap<>();
        //settings.put("hibernate.connection.driver_class", org.mariadb.jdbc.Driver.class.getCanonicalName());
        //settings.put("hibernate.dialect", org.hibernate.dialect.MySQL57Dialect.class.getCanonicalName());
        //settings.put("hibernate.dialect", org.hibernate.dialect.PostgreSQL95Dialect.class.getCanonicalName());
        settings.put("hibernate.dialect", org.hibernate.dialect.H2Dialect.class.getCanonicalName());
        //settings.put("hibernate.connection.url", "jdbc:mysql://localhost/testdb?useSSL=false");
        //settings.put("hibernate.connection.username", "root");
        //settings.put("hibernate.connection.password", "");
        settings.put("hibernate.hbm2ddl.auto", "create");
        settings.put("show_sql", "true");
        settings.put("hibernate.physical_naming_strategy", "org.springframework.boot.orm.jpa.hibernate.SpringPhysicalNamingStrategy");

        MetadataSources metadata = new MetadataSources(
                new StandardServiceRegistryBuilder()
                        .applySettings(settings)
                        .build());
        var scan = new ClassPathScanningCandidateComponentProvider(true);
        scan.addIncludeFilter(new AnnotationTypeFilter(Entity.class));
        scan.findCandidateComponents(SchemaGenerator.class.getPackageName()).stream()
                .map(BeanDefinition::getBeanClassName)
                .map(className -> {
                    try {
                        return Class.forName(className);
                    } catch (ClassNotFoundException e) {
                        throw new RuntimeException(className, e);
                    }
                })
                .forEach(metadata::addAnnotatedClass);
        SchemaExport schemaExport = new SchemaExport();
        schemaExport.setHaltOnError(true);
        schemaExport.setFormat(true);
        schemaExport.setDelimiter(";");
        schemaExport.execute(EnumSet.of(TargetType.STDOUT), SchemaExport.Action.CREATE, metadata.buildMetadata());
    }
}
