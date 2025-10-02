# Video Calling Feature - Testing Guide

## Overview
This guide outlines comprehensive testing procedures for the video calling feature.

## Prerequisites
- Two user accounts (for testing peer-to-peer connections)
- Multiple devices/browsers for cross-platform testing
- Different network conditions (WiFi, 4G, 3G, etc.)

## 1. WebRTC Peer Connection Testing

### Basic Connection Test
1. **Setup**: Log in with two different users on separate devices/browsers
2. **Test Steps**:
   - User A initiates a video call to User B
   - User B receives the incoming call notification
   - User B accepts the call
   - Verify both users can see and hear each other
3. **Expected Result**: Successful bidirectional audio/video stream
4. **Pass/Fail**: ___________

### Connection States
- [ ] Verify "Connecting..." state shows when call starts
- [ ] Verify "Connected" badge appears when peer connection is established
- [ ] Verify local video preview works before connection
- [ ] Verify remote video shows after connection

## 2. STUN/TURN Server Configuration

### Server Connectivity
1. **STUN Servers**: 
   - Google STUN servers (primary)
   - Mozilla STUN servers (fallback)
   - Verify at least one STUN server is reachable
   
2. **TURN Servers**:
   - OpenRelay TURN servers
   - ExpressTurn TURN servers
   - Test with restrictive network (corporate firewall/NAT)

### Network Scenarios
- [ ] Test on same local network (should use STUN only)
- [ ] Test across different networks (should use STUN/TURN)
- [ ] Test behind symmetric NAT (should use TURN)
- [ ] Test with firewall blocking UDP (should fallback to TCP TURN)

## 3. Error Handling Tests

### Media Access Errors
- [ ] Deny camera permission → Show "Camera access denied" error
- [ ] Deny microphone permission → Show "Microphone access denied" error
- [ ] Camera in use by another app → Show "Camera in use" error
- [ ] No camera/microphone available → Show "Device not found" error

### Connection Errors
- [ ] Network disconnection during call → Show "Reconnecting..." overlay
- [ ] Peer disconnects → Show "Partner ended call" message
- [ ] ICE connection failure → Attempt reconnection, show error after timeout
- [ ] Signaling errors → Show "Unable to connect" error

### Rate Limiting
- [ ] Attempt multiple rapid calls → Show rate limit warning
- [ ] Verify rate limit resets after time window

## 4. Call Quality Monitoring

### Quality Metrics
1. **Check Database Logs**:
   ```sql
   SELECT * FROM call_quality_logs 
   WHERE call_session_id = '<session_id>'
   ORDER BY timestamp DESC;
   ```

2. **Verify Logged Metrics**:
   - [ ] Connection state (connected/disconnected)
   - [ ] ICE connection state
   - [ ] Packet loss rate
   - [ ] Latency (RTT)
   - [ ] Audio quality score
   - [ ] Video quality score

### Quality Indicators
- [ ] "Excellent" badge: < 2% packet loss, < 150ms latency
- [ ] "Good" badge: 2-5% packet loss, 150-300ms latency
- [ ] "Poor" badge: > 5% packet loss, > 300ms latency
- [ ] "Reconnecting" overlay on connection issues

## 5. UI for Connection Issues

### Visual Feedback
- [ ] Connection quality badge updates every 5 seconds
- [ ] "Reconnecting..." overlay shows when connection drops
- [ ] Animated loading indicators during reconnection
- [ ] "Poor connection" warning for degraded quality
- [ ] Clear error messages for fatal errors

### User Actions
- [ ] End call button always accessible
- [ ] Minimize call option works during connection issues
- [ ] Controls disabled during reconnection
- [ ] Auto-end call after failed reconnection (15s timeout)

## 6. Screen Sharing Tests

### Basic Functionality
- [ ] Click screen share button
- [ ] Select screen/window/tab to share
- [ ] Verify partner sees shared screen
- [ ] Video feed switches from camera to screen
- [ ] Click again to stop sharing → returns to camera

### Edge Cases
- [ ] Share screen then minimize call → screen sharing continues
- [ ] Share screen then toggle video off → screen sharing stops
- [ ] Cancel screen share dialog → no error, returns to normal
- [ ] Close shared tab/window → automatically stops sharing

## 7. Call History Verification

### Database Checks
```sql
-- Verify call was logged
SELECT * FROM call_history 
WHERE pair_id = '<pair_id>'
ORDER BY created_at DESC
LIMIT 10;

-- Verify call session was created
SELECT * FROM call_sessions
WHERE pair_id = '<pair_id>'
ORDER BY created_at DESC
LIMIT 10;
```

### Required Fields
- [ ] caller_id matches initiator
- [ ] receiver_id matches recipient
- [ ] call_type ('video' or 'audio')
- [ ] duration_seconds calculated correctly
- [ ] end_reason populated ('completed', 'declined', 'error', etc.)
- [ ] started_at and ended_at timestamps correct
- [ ] quality_score (optional, averaged from quality logs)

## 8. Call Notifications

### Desktop Notifications
- [ ] Browser notification shows when call comes in
- [ ] Notification plays sound
- [ ] Notification shows caller name and avatar
- [ ] Click notification focuses app window
- [ ] Notification disappears when call answered/declined

### Mobile Notifications  
- [ ] Device vibrates on incoming call
- [ ] Full-screen call interface shows
- [ ] Ringtone plays (if implemented)
- [ ] Accept/Decline buttons clearly visible
- [ ] Auto-decline after 30 seconds

### Permission Handling
- [ ] Request notification permission on first call
- [ ] Gracefully handle denied permission
- [ ] Show instructions if notifications blocked

## 9. Cross-Platform Testing

### Desktop Browsers
- [ ] Chrome (Windows/Mac/Linux)
- [ ] Firefox (Windows/Mac/Linux)
- [ ] Safari (Mac only)
- [ ] Edge (Windows)

### Mobile Browsers
- [ ] Chrome (Android)
- [ ] Safari (iOS)
- [ ] Firefox (Android)
- [ ] Samsung Internet (Android)

### Mobile Considerations
- [ ] Adaptive bitrate works (lower quality on poor network)
- [ ] Mobile-optimized video constraints (640x480 max)
- [ ] Screen doesn't turn off during call
- [ ] Audio continues in background
- [ ] Proper cleanup on app backgrounding

## 10. Network Condition Tests

### Different Network Speeds
- [ ] High-speed WiFi (50+ Mbps) → HD quality
- [ ] Standard WiFi (10-20 Mbps) → SD quality  
- [ ] 4G LTE → Adaptive quality
- [ ] 3G → Low quality, possible reconnections
- [ ] Switching networks mid-call → Reconnection successful

### Network Transitions
- [ ] WiFi to cellular handoff
- [ ] Cellular to WiFi handoff
- [ ] Brief network interruption (< 5s)
- [ ] Extended network loss (> 10s) → Call ends

## Known Limitations

1. **Browser Support**: WebRTC requires modern browsers. IE not supported.
2. **iOS Safari**: Requires user gesture to start call (no auto-answer).
3. **Corporate Networks**: May require TURN servers for symmetric NAT.
4. **Mobile Background**: Call may end when app backgrounded on some devices.

## Troubleshooting

### Common Issues

**No video/audio stream**
- Check camera/microphone permissions
- Verify device not in use by another app
- Check browser console for errors

**Can't establish connection**
- Check STUN/TURN server accessibility
- Verify network allows WebRTC traffic
- Check firewall settings

**Poor quality**
- Check network speed (speedtest)
- Verify packet loss < 5%
- Test with different network

**Reconnection fails**
- Mobile: May need TURN server
- Check ICE candidate gathering
- Verify network stability

## Testing Checklist

Use this checklist to track testing progress:

- [ ] 1. WebRTC Peer Connection Tests (Pass/Fail: _____)
- [ ] 2. STUN/TURN Configuration (Pass/Fail: _____)
- [ ] 3. Error Handling (Pass/Fail: _____)
- [ ] 4. Call Quality Monitoring (Pass/Fail: _____)
- [ ] 5. Connection Issue UI (Pass/Fail: _____)
- [ ] 6. Screen Sharing (Pass/Fail: _____)
- [ ] 7. Call History (Pass/Fail: _____)
- [ ] 8. Call Notifications (Pass/Fail: _____)
- [ ] 9. Cross-Platform (Pass/Fail: _____)
- [ ] 10. Network Conditions (Pass/Fail: _____)

## Success Criteria

The video calling feature is considered complete when:
1. ✅ All core connection tests pass
2. ✅ Error handling works for all scenarios
3. ✅ Call quality monitoring logs correctly
4. ✅ Screen sharing works reliably
5. ✅ Call history saves properly
6. ✅ Notifications work on all platforms
7. ✅ Works on at least 3 different network conditions
8. ✅ Works on both desktop and mobile browsers
