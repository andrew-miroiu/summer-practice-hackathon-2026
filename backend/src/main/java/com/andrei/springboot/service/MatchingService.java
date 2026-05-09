package com.andrei.springboot.service;

import java.util.*;

public interface MatchingService {
    Map<String, Object> matchForSport(String sport);
    List<Map<String, Object>> matchAll();
}