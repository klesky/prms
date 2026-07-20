package engineering.everest.prms.exception.handler;

import engineering.everest.prms.exception.CrewLeadLimitExceededException;
import engineering.everest.prms.exception.CrewLeadNotFoundException;
import engineering.everest.prms.exception.DuplicateCrewLeadException;
import engineering.everest.prms.exception.DuplicatePassengerException;
import engineering.everest.prms.exception.InsufficientMembershipLevelException;
import engineering.everest.prms.exception.PassengerNotFoundException;
import engineering.everest.prms.exception.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(CrewLeadLimitExceededException.class)
    public ResponseEntity<Object> handleCrewLeadLimitExceeded(CrewLeadLimitExceededException ex) {
        return problem(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(DuplicateCrewLeadException.class)
    public ResponseEntity<Object> handleDuplicateCrewLead(DuplicateCrewLeadException ex) {
        return problem(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(CrewLeadNotFoundException.class)
    public ResponseEntity<Object> handleCrewLeadNotFound(CrewLeadNotFoundException ex) {
        return problem(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Object> handleResourceNotFound(ResourceNotFoundException ex) {
        return problem(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(PassengerNotFoundException.class)
    public ResponseEntity<Object> handlePassengerNotFound(PassengerNotFoundException ex) {
        return problem(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(DuplicatePassengerException.class)
    public ResponseEntity<Object> handleDuplicatePassenger(DuplicatePassengerException ex) {
        return problem(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(InsufficientMembershipLevelException.class)
    public ResponseEntity<Object> handleInsufficientMembershipLevel(InsufficientMembershipLevelException ex) {
        return problem(HttpStatus.FORBIDDEN, ex.getMessage());
    }

    private ResponseEntity<Object> problem(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of(
            "timestamp", Instant.now().toString(),
            "status", status.value(),
            "error", status.getReasonPhrase(),
            "message", message));
    }
}
