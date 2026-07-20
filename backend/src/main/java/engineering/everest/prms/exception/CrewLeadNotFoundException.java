package engineering.everest.prms.exception;

public class CrewLeadNotFoundException extends RuntimeException {

    public CrewLeadNotFoundException(String username) {
        super("No crew lead found with username " + username);
    }
}
