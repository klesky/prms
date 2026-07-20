package engineering.everest.prms.service;

import engineering.everest.prms.entity.Passenger;
import engineering.everest.prms.entity.Resource;
import engineering.everest.prms.exception.InsufficientMembershipLevelException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service("authService")
public class AuthService {

    @Autowired
    private PassengerService passengerService;

    @Autowired
    private ResourceService resourceService;

    public boolean canUseResource(UUID resourceId) {
        Jwt jwt = (Jwt) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username = jwt.getClaimAsString("preferred_username");

        Passenger passenger = passengerService.findById(username);
        Resource resource = resourceService.findById(resourceId);

        if (!resource.isAccessibleTo(passenger.getMembershipLevel())) {
            throw new InsufficientMembershipLevelException(resource.getName(), resource.getMinRequiredLevel(),
                passenger.getMembershipLevel());
        }
        return true;
    }
}
