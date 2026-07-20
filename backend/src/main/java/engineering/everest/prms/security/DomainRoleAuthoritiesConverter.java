package engineering.everest.prms.security;

import engineering.everest.prms.repository.CrewLeadRepository;
import engineering.everest.prms.repository.PassengerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.List;

/**
 * Keycloak only proves who a caller is (their username). Whether that person is a
 * crew lead or a passenger - and what it entitles them to - is decided fresh on every
 * request from our own Postgres tables, since both can change dynamically (tier
 * upgrades, crew lead assignment) without any way to push that back into Keycloak.
 */
@Component
public class DomainRoleAuthoritiesConverter implements Converter<Jwt, Collection<GrantedAuthority>> {

    @Autowired
    private CrewLeadRepository crewLeadRepository;

    @Autowired
    private PassengerRepository passengerRepository;

    @Override
    public Collection<GrantedAuthority> convert(Jwt jwt) {
        String username = jwt.getClaimAsString("preferred_username");
        if (crewLeadRepository.existsById(username)) {
            return List.of(new SimpleGrantedAuthority("ROLE_crew-lead"));
        }
        if (passengerRepository.existsById(username)) {
            return List.of(new SimpleGrantedAuthority("ROLE_passenger"));
        }
        return List.of();
    }
}
