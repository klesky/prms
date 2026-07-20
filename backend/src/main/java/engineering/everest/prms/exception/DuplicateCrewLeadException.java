package engineering.everest.prms.exception;

public class DuplicateCrewLeadException extends RuntimeException {

    public DuplicateCrewLeadException(String username) {
        super("A crew lead is already registered with username " + username);
    }
}
