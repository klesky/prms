package engineering.everest.prms.exception;

public class DuplicatePassengerException extends RuntimeException {

    public DuplicatePassengerException(String username) {
        super("A passenger is already registered with username " + username);
    }
}
