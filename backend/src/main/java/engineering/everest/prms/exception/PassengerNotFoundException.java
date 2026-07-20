package engineering.everest.prms.exception;

public class PassengerNotFoundException extends RuntimeException {

    public PassengerNotFoundException(String username) {
        super("No passenger found with username " + username);
    }
}
