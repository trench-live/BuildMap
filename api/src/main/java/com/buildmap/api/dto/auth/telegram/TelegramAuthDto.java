package com.buildmap.api.dto.auth.telegram;

import lombok.Data;

@Data
public class TelegramAuthDto {
    private Long id;
    private String first_name;
    private String last_name;
    private String username;
    private String photo_url;
    private Long auth_date;
    private String hash;
}