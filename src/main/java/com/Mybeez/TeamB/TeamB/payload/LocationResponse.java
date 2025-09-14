package com.Mybeez.TeamB.TeamB.payload;

import com.Mybeez.TeamB.TeamB.model.Location;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class LocationResponse {

    private String address;
    private String city;
    private String postcode;
//    private Double latitude;
//    private Double longitude;

    public LocationResponse(Location location) {
        this.address = location.getAddress();
        this.city = location.getCity();
        this.postcode = location.getPostcode();
//        this.latitude = location.getLatitude();
//        this.longitude = location.getLongitude();
    }
}