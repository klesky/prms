package engineering.everest.prms.entity;

public enum MembershipLevel {
    SILVER,
    GOLD,
    PLATINUM;

    /**
     * Higher tiers inherit every lower tier's access (Silver < Gold < Platinum),
     * per the enum's declaration order.
     */
    public boolean grantsAccessTo(MembershipLevel required) {
        return this.ordinal() >= required.ordinal();
    }
}
