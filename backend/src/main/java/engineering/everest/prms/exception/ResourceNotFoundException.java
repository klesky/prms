package engineering.everest.prms.exception;

import java.util.UUID;

public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(UUID resourceId) {
        super("No resource found with id " + resourceId);
    }
}
