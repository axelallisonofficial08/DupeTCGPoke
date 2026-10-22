/**
 * Pokémon TCG Mega Duel - Realtime Traffic & Online Presence Tracker
 * Powered by MQTT over WebSockets (HiveMQ public WSS) with BroadcastChannel fallback.
 * Allows all players across the world / GitHub Pages to see who is currently opening and playing.
 */

(function (root) {
  'use strict';

  var BROKER_HOST = 'broker.hivemq.com';
  var BROKER_PORT = 8884;
  var BROKER_PATH = '/mqtt';
  var PRESENCE_TOPIC = 'dupetcgpoke/presence/v1';
  var HEARTBEAT_INTERVAL_MS = 6000;
  var CLIENT_TIMEOUT_MS = 16000;

  function generateId(prefix) {
    return (prefix || 'usr_') + Math.random().toString(36).substring(2, 9);
  }

  function getDeviceInfo() {
    var ua = navigator.userAgent || '';
    var deviceType = 'desktop';
    var icon = '💻';
    var osLabel = 'PC';
    var browserLabel = 'Browser';

    if (/iPad|Tablet/i.test(ua)) {
      deviceType = 'tablet';
      icon = '📱';
    } else if (/Mobi|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
      deviceType = 'mobile';
      icon = '📱';
    }

    if (/iPhone|iPad|iPod/i.test(ua)) osLabel = 'iOS';
    else if (/Android/i.test(ua)) osLabel = 'Android';
    else if (/Windows/i.test(ua)) osLabel = 'Windows';
    else if (/Macintosh|Mac OS/i.test(ua)) osLabel = 'macOS';
    else if (/Linux/i.test(ua)) osLabel = 'Linux';

    if (/Edg\//i.test(ua)) browserLabel = 'Edge';
    else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) browserLabel = 'Chrome';
    else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browserLabel = 'Safari';
    else if (/Firefox\//i.test(ua)) browserLabel = 'Firefox';

    var desc = icon + ' ' + (deviceType === 'mobile' ? 'Smartphone' : deviceType === 'tablet' ? 'Tablet' : 'Komputer');
    return {
      type: deviceType,
      icon: icon,
      os: osLabel,
      browser: browserLabel,
      fullLabel: desc + ' (' + osLabel + ' · ' + browserLabel + ')'
    };
  }

  var TrafficPresence = {
    mySessionId: null,
    myNickname: null,
    deviceInfo: null,
    currentAction: 'Di Menu Utama',
    joinedAt: Date.now(),
    lastPing: Date.now(),
    
    // Map of active sessions: id -> { id, name, device, os, browser, fullLabel, action, joinedAt, lastSeen, isYou }
    sessions: new Map(),
    
    mqttClient: null,
    broadcastChannel: null,
    isConnected: false,
    timerId: null,

    init: function () {
      // 1. Session & Nickname setup
      var storedSession = sessionStorage.getItem('tcg_session_id');
      if (!storedSession) {
        storedSession = generateId('p_');
        sessionStorage.setItem('tcg_session_id', storedSession);
      }
      this.mySessionId = storedSession;

      var storedNick = localStorage.getItem('tcg_player_nickname');
      if (!storedNick) {
        var randomNum = Math.floor(1000 + Math.random() * 9000);
        storedNick = 'Trainer #' + randomNum;
        localStorage.setItem('tcg_player_nickname', storedNick);
      }
      this.myNickname = storedNick;
      this.deviceInfo = getDeviceInfo();

      // Register self in session map
      this._updateSelfSession();

      // 2. Setup BroadcastChannel (multi-tab support on same device)
      if (typeof BroadcastChannel !== 'undefined') {
        try {
          this.broadcastChannel = new BroadcastChannel('dupetcg_presence_channel');
          this.broadcastChannel.onmessage = (event) => {
            if (event.data) this._handleMessage(event.data);
          };
        } catch (e) {
          console.warn('BroadcastChannel not supported:', e);
        }
      }

      // 3. Connect to MQTT over WebSocket
      this._connectMQTT();

      // 4. Start periodic heartbeat and pruning
      this.timerId = setInterval(() => {
        this._sendHeartbeat();
        this._pruneDeadSessions();
        this._updateUI();
      }, HEARTBEAT_INTERVAL_MS);

      // 5. Cleanup on unload
      window.addEventListener('beforeunload', () => {
        this._broadcast({
          type: 'leave',
          id: this.mySessionId
        });
      });

      this._updateUI();
    },

    _updateSelfSession: function () {
      this.sessions.set(this.mySessionId, {
        id: this.mySessionId,
        name: this.myNickname,
        deviceType: this.deviceInfo.type,
        icon: this.deviceInfo.icon,
        os: this.deviceInfo.os,
        browser: this.deviceInfo.browser,
        fullLabel: this.deviceInfo.fullLabel,
        action: this.currentAction,
        joinedAt: this.joinedAt,
        lastSeen: Date.now(),
        isYou: true
      });
    },

    setNickname: function (newName) {
      if (!newName || !newName.trim()) return;
      this.myNickname = newName.trim().substring(0, 24);
      localStorage.setItem('tcg_player_nickname', this.myNickname);
      this._updateSelfSession();
      this._broadcast({
        type: 'update',
        session: this.sessions.get(this.mySessionId)
      });
      this._updateUI();
    },

    setAction: function (newAction) {
      if (!newAction || this.currentAction === newAction) return;
      this.currentAction = newAction;
      this._updateSelfSession();
      this._broadcast({
        type: 'update',
        session: this.sessions.get(this.mySessionId)
      });
      this._updateUI();
    },

    _connectMQTT: function () {
      if (typeof Paho === 'undefined' || !Paho.Client) {
        console.warn('Paho MQTT library not loaded, using local presence.');
        return;
      }

      try {
        var clientId = 'poke_' + this.mySessionId + '_' + Math.random().toString(36).substring(2, 6);
        this.mqttClient = new Paho.Client(BROKER_HOST, BROKER_PORT, BROKER_PATH, clientId);

        this.mqttClient.onConnectionLost = (responseObject) => {
          this.isConnected = false;
          this._updateConnectionBadge();
          if (responseObject.errorCode !== 0) {
            console.warn('MQTT Connection lost:', responseObject.errorMessage);
            setTimeout(() => this._connectMQTT(), 5000);
          }
        };

        this.mqttClient.onMessageArrived = (message) => {
          try {
            var data = JSON.parse(message.payloadString);
            this._handleMessage(data);
          } catch (e) {
            // ignore non-json messages
          }
        };

        this.mqttClient.connect({
          useSSL: true,
          timeout: 5,
          keepAliveInterval: 30,
          cleanSession: true,
          onSuccess: () => {
            this.isConnected = true;
            this.mqttClient.subscribe(PRESENCE_TOPIC, { qos: 0 });
            this._updateConnectionBadge();
            // Announce presence immediately
            this._broadcast({
              type: 'announce',
              session: this.sessions.get(this.mySessionId)
            });
          },
          onFailure: (err) => {
            this.isConnected = false;
            this._updateConnectionBadge();
            console.warn('MQTT connect failure, retry in 8s:', err);
            setTimeout(() => this._connectMQTT(), 8000);
          }
        });
      } catch (err) {
        console.warn('Error starting MQTT client:', err);
      }
    },

    _broadcast: function (payload) {
      // 1. Broadcast via BroadcastChannel
      if (this.broadcastChannel) {
        try {
          this.broadcastChannel.postMessage(payload);
        } catch (e) {}
      }

      // 2. Broadcast via MQTT
      if (this.mqttClient && this.isConnected) {
        try {
          var msg = new Paho.Message(JSON.stringify(payload));
          msg.destinationName = PRESENCE_TOPIC;
          msg.qos = 0;
          this.mqttClient.send(msg);
        } catch (e) {
          console.warn('Failed to send MQTT message:', e);
        }
      }
    },

    _sendHeartbeat: function () {
      this._updateSelfSession();
      this._broadcast({
        type: 'heartbeat',
        session: this.sessions.get(this.mySessionId)
      });
    },

    _handleMessage: function (data) {
      if (!data || !data.type) return;

      if (data.type === 'leave') {
        if (data.id && data.id !== this.mySessionId) {
          this.sessions.delete(data.id);
          this._updateUI();
        }
        return;
      }

      var session = data.session;
      if (!session || !session.id || session.id === this.mySessionId) return;

      session.lastSeen = Date.now();
      session.isYou = false;
      this.sessions.set(session.id, session);

      // If a new user announced themselves, answer with our own session so they see us immediately
      if (data.type === 'announce') {
        this._broadcast({
          type: 'heartbeat',
          session: this.sessions.get(this.mySessionId)
        });
      }

      this._updateUI();
    },

    _pruneDeadSessions: function () {
      var now = Date.now();
      this.sessions.forEach((s, id) => {
        if (id !== this.mySessionId && (now - s.lastSeen) > CLIENT_TIMEOUT_MS) {
          this.sessions.delete(id);
        }
      });
    },

    _updateConnectionBadge: function () {
      var connEl = document.getElementById('trafficConnectionStatus');
      if (connEl) {
        if (this.isConnected) {
          connEl.className = 'traffic-conn-status live';
          connEl.textContent = '🟢 Terhubung Global (Live)';
        } else {
          connEl.className = 'traffic-conn-status local';
          connEl.textContent = '🟡 Mode Lokal / Offline';
        }
      }
    },

    _updateUI: function () {
      var totalCount = this.sessions.size;
      var mobileCount = 0;
      var desktopCount = 0;

      this.sessions.forEach(function (s) {
        if (s.deviceType === 'mobile' || s.deviceType === 'tablet') {
          mobileCount++;
        } else {
          desktopCount++;
        }
      });

      // Update Topbar badge
      var topbarBadge = document.getElementById('trafficBadge');
      if (topbarBadge) {
        topbarBadge.textContent = totalCount + ' Online';
      }

      var tabCount = document.getElementById('trafficTabCount');
      if (tabCount) tabCount.textContent = totalCount;

      var statOnline = document.getElementById('statOnlineCount');
      if (statOnline) statOnline.textContent = totalCount;

      var statMobile = document.getElementById('statMobileCount');
      if (statMobile) statMobile.textContent = mobileCount;

      var statDesktop = document.getElementById('statDesktopCount');
      if (statDesktop) statDesktop.textContent = desktopCount;

      // Render user list if container exists
      var listContainer = document.getElementById('trafficUsersList');
      if (listContainer) {
        this._renderUserList(listContainer);
      }
    },

    _formatTimeAgo: function (timestamp) {
      var sec = Math.floor((Date.now() - timestamp) / 1000);
      if (sec < 10) return 'Baru saja';
      if (sec < 60) return sec + ' detik lalu';
      var min = Math.floor(sec / 60);
      if (min < 60) return min + ' menit lalu';
      var hr = Math.floor(min / 60);
      return hr + ' jam lalu';
    },

    _renderUserList: function (container) {
      container.innerHTML = '';

      // Sort sessions: self first, then by joinedAt ascending
      var sorted = Array.from(this.sessions.values()).sort(function (a, b) {
        if (a.isYou) return -1;
        if (b.isYou) return 1;
        return a.joinedAt - b.joinedAt;
      });

      sorted.forEach((item) => {
        var el = document.createElement('div');
        el.className = 'traffic-user-item' + (item.isYou ? ' is-you' : '');

        var avatar = item.icon || '🧑';
        var nameHtml = (item.name || 'Trainer') + (item.isYou ? ' <span class="badge-you">KAMU</span>' : '');
        var deviceHtml = item.fullLabel || 'Web Browser';
        var actionHtml = item.action || 'Di Menu Utama';
        var timeHtml = this._formatTimeAgo(item.joinedAt);

        el.innerHTML = `
          <div class="user-avatar-wrap">
            <span class="user-avatar">${avatar}</span>
            <span class="user-status-dot online"></span>
          </div>
          <div class="user-main-info">
            <div class="user-headline">
              <strong class="user-name">${nameHtml}</strong>
              <span class="user-device-tag">${deviceHtml}</span>
            </div>
            <div class="user-subline">
              <span class="user-action">⚡ ${actionHtml}</span>
              <span class="user-dot-sep">•</span>
              <span class="user-time">Online: ${timeHtml}</span>
            </div>
          </div>
          <div class="user-pill-status">
            <span class="pulse-ring"></span>
            <span>Online</span>
          </div>
        `;
        container.appendChild(el);
      });
    }
  };

  root.TrafficPresence = TrafficPresence;

  // Auto initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      TrafficPresence.init();
    });
  } else {
    TrafficPresence.init();
  }

})(typeof window !== 'undefined' ? window : this);
