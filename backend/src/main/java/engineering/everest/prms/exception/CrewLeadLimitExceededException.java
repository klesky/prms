package engineering.everest.prms.exception;

public class CrewLeadLimitExceededException extends RuntimeException {

    public CrewLeadLimitExceededException(int maxCrewLeads) {
        super("Cannot register another crew lead: the ship allows exactly " + maxCrewLeads + " crew leads");
    }
}
