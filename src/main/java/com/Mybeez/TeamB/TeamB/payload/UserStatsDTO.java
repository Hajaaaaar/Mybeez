package com.Mybeez.TeamB.TeamB.payload;

public class UserStatsDTO {
    private long totalUsers;
    private long activeUsers;
    private long inactiveUsers;
    private long bannedUsers;
    private long deletedUsers;

    public UserStatsDTO(long totalUsers, long activeUsers, long inactiveUsers, long bannedUsers, long deletedUsers) {
        this.totalUsers = totalUsers;
        this.activeUsers = activeUsers;
        this.inactiveUsers = inactiveUsers;
        this.bannedUsers = bannedUsers;
        this.deletedUsers = deletedUsers;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getActiveUsers() {
        return activeUsers;
    }

    public void setActiveUsers(long activeUsers) {
        this.activeUsers = activeUsers;
    }

    public long getInactiveUsers() {
        return inactiveUsers;
    }

    public void setInactiveUsers(long inactiveUsers) {
        this.inactiveUsers = inactiveUsers;
    }

    public long getBannedUsers() {
        return bannedUsers;
    }

    public void setBannedUsers(long bannedUsers) {
        this.bannedUsers = bannedUsers;
    }

    public long getDeletedUsers() {
        return deletedUsers;
    }

    public void setDeletedUsers(long deletedUsers) {
        this.deletedUsers = deletedUsers;
    }
}
