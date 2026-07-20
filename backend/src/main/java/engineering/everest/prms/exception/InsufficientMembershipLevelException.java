package engineering.everest.prms.exception;

import engineering.everest.prms.entity.MembershipLevel;

public class InsufficientMembershipLevelException extends RuntimeException {

    public InsufficientMembershipLevelException(String resourceName, MembershipLevel required, MembershipLevel actual) {
        super("'" + resourceName + "' requires " + required + " membership; passenger is " + actual);
    }
}
