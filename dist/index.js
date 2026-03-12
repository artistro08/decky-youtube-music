const manifest = {"name":"YouTube Music"};
const API_VERSION = 2;
const internalAPIConnection = window.__DECKY_SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED_deckyLoaderAPIInit;
if (!internalAPIConnection) {
    throw new Error('[@decky/api]: Failed to connect to the loader as as the loader API was not initialized. This is likely a bug in Decky Loader.');
}
let api;
try {
    api = internalAPIConnection.connect(API_VERSION, manifest.name);
}
catch {
    api = internalAPIConnection.connect(1, manifest.name);
    console.warn(`[@decky/api] Requested API version ${API_VERSION} but the running loader only supports version 1. Some features may not work.`);
}
if (api._version != API_VERSION) {
    console.warn(`[@decky/api] Requested API version ${API_VERSION} but the running loader only supports version ${api._version}. Some features may not work.`);
}
const definePlugin = (fn) => {
    return (...args) => {
        return fn(...args);
    };
};

var DefaultContext = {
  color: undefined,
  size: undefined,
  className: undefined,
  style: undefined,
  attr: undefined
};
var IconContext = SP_REACT.createContext && /*#__PURE__*/SP_REACT.createContext(DefaultContext);

var _excluded = ["attr", "size", "title"];
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), true).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: true, configurable: true, writable: true }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function Tree2Element(tree) {
  return tree && tree.map((node, i) => /*#__PURE__*/SP_REACT.createElement(node.tag, _objectSpread({
    key: i
  }, node.attr), Tree2Element(node.child)));
}
function GenIcon(data) {
  return props => /*#__PURE__*/SP_REACT.createElement(IconBase, _extends({
    attr: _objectSpread({}, data.attr)
  }, props), Tree2Element(data.child));
}
function IconBase(props) {
  var elem = conf => {
    var {
        attr,
        size,
        title
      } = props,
      svgProps = _objectWithoutProperties(props, _excluded);
    var computedSize = size || conf.size || "1em";
    var className;
    if (conf.className) className = conf.className;
    if (props.className) className = (className ? className + " " : "") + props.className;
    return /*#__PURE__*/SP_REACT.createElement("svg", _extends({
      stroke: "currentColor",
      fill: "currentColor",
      strokeWidth: "0"
    }, conf.attr, attr, svgProps, {
      className: className,
      style: _objectSpread(_objectSpread({
        color: props.color || conf.color
      }, conf.style), props.style),
      height: computedSize,
      width: computedSize,
      xmlns: "http://www.w3.org/2000/svg"
    }), title && /*#__PURE__*/SP_REACT.createElement("title", null, title), props.children);
  };
  return IconContext !== undefined ? /*#__PURE__*/SP_REACT.createElement(IconContext.Consumer, null, conf => elem(conf)) : elem(DefaultContext);
}

// THIS FILE IS AUTO GENERATED
function FaMusic (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M470.38 1.51L150.41 96A32 32 0 0 0 128 126.51v261.41A139 139 0 0 0 96 384c-53 0-96 28.66-96 64s43 64 96 64 96-28.66 96-64V214.32l256-75v184.61a138.4 138.4 0 0 0-32-3.93c-53 0-96 28.66-96 64s43 64 96 64 96-28.65 96-64V32a32 32 0 0 0-41.62-30.49z"},"child":[]}]})(props);
}

let authListeners = [];
const addAuthListener = (fn) => {
    authListeners.push(fn);
    return () => { authListeners = authListeners.filter((l) => l !== fn); };
};
const notifyAuthRequired = () => authListeners.forEach((l) => l());

const BASE_URL = 'http://127.0.0.1:26538/api/v1';
const TOKEN_KEY = 'ytmusic_api_token';
const getToken = () => localStorage.getItem(TOKEN_KEY);
const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
const headers = () => {
    const token = getToken();
    const h = { 'Content-Type': 'application/json' };
    if (token)
        h['Authorization'] = `Bearer ${token}`;
    return h;
};
// Returns true on success, false on 401 (triggers auth prompt), throws on other errors
const post = async (path, body) => {
    try {
        const res = await fetch(`${BASE_URL}${path}`, {
            method: 'POST',
            headers: headers(),
            body: body ? JSON.stringify(body) : undefined,
        });
        if (res.status === 401) {
            notifyAuthRequired();
            return false;
        }
        return true;
    }
    catch {
        return true; // network error, not auth error
    }
};
const get = async (path) => {
    try {
        const res = await fetch(`${BASE_URL}${path}`, { headers: headers() });
        if (res.status === 401) {
            notifyAuthRequired();
            return null;
        }
        if (res.status === 204)
            return null;
        return res.json();
    }
    catch {
        return null;
    }
};
const del = async (path) => {
    try {
        await fetch(`${BASE_URL}${path}`, { method: 'DELETE', headers: headers() });
    }
    catch {
        // silent
    }
};
const patch = async (path, body) => {
    try {
        await fetch(`${BASE_URL}${path}`, {
            method: 'PATCH',
            headers: headers(),
            body: JSON.stringify(body),
        });
    }
    catch {
        // silent
    }
};
const togglePlay = () => post('/toggle-play');
const next = () => post('/next');
const previous = () => post('/previous');
const seekTo = (seconds) => post('/seek-to', { seconds });
const setVolume = (volume) => post('/volume', { volume });
const toggleMute = () => post('/toggle-mute');
const shuffle = () => post('/shuffle');
const switchRepeat = (iteration) => post('/switch-repeat', { iteration });
const like = () => post('/like');
const dislike = () => post('/dislike');
const getVolume = () => get('/volume');
// Queue
const getQueue = () => get('/queue');
const removeFromQueue = (index) => del(`/queue/${index}`);
const clearQueue = () => del('/queue');
const setQueueIndex = (index) => patch('/queue', { index });

const WS_URL = 'ws://127.0.0.1:26538/api/v1/ws';
const RECONNECT_DELAY_MS = 5000;
let socket = null;
let reconnectTimer = null;
let listeners = [];
let destroyed = false;
const addStateListener = (fn) => {
    listeners.push(fn);
    return () => { listeners = listeners.filter((l) => l !== fn); };
};
const notify = (state) => listeners.forEach((l) => l(state));
const buildUrl = () => {
    const token = getToken();
    return token ? `${WS_URL}?token=${encodeURIComponent(token)}` : WS_URL;
};
const connect = () => {
    if (destroyed)
        return;
    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING))
        return;
    socket = new WebSocket(buildUrl());
    socket.onopen = () => {
        if (reconnectTimer) {
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
        }
        notify({ connected: true, authRequired: false });
    };
    socket.onmessage = (event) => {
        try {
            const msg = JSON.parse(event.data);
            handleMessage(msg);
        }
        catch {
            // ignore malformed messages
        }
    };
    socket.onclose = () => {
        notify({ connected: false });
        if (!destroyed) {
            reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS);
        }
    };
    socket.onerror = () => {
        socket?.close();
    };
};
const disconnect = () => {
    destroyed = true;
    if (reconnectTimer)
        clearTimeout(reconnectTimer);
    socket?.close();
    socket = null;
};
const resetAndConnect = () => {
    destroyed = false;
    connect();
};
const handleMessage = (msg) => {
    const type = msg.type;
    switch (type) {
        case 'PLAYER_INFO': {
            // Only include volume/muted if the server actually sent them.
            // `?? 100` / `?? false` would silently reset to defaults when the field
            // is absent, corrupting whatever the user last set.
            const playerInfo = {
                song: msg.song,
                isPlaying: msg.isPlaying ?? false,
                position: msg.position ?? 0,
                repeat: msg.repeat ?? 'NONE',
                shuffle: msg.shuffle ?? false,
                connected: true,
                authRequired: false,
            };
            if (msg.volume !== undefined)
                playerInfo.volume = msg.volume;
            if (msg.muted !== undefined)
                playerInfo.muted = msg.muted;
            notify(playerInfo);
            break;
        }
        case 'VIDEO_CHANGED':
            notify({ song: msg.song, position: 0 });
            break;
        case 'PLAYER_STATE_CHANGED':
            notify({ isPlaying: msg.isPlaying ?? false, position: msg.position ?? 0 });
            break;
        case 'POSITION_CHANGED':
            notify({ position: msg.position ?? 0 });
            break;
        case 'VOLUME_CHANGED': {
            const volUpdate = {};
            if (msg.volume !== undefined)
                volUpdate.volume = msg.volume;
            if (msg.muted !== undefined)
                volUpdate.muted = msg.muted;
            notify(volUpdate);
            break;
        }
        case 'REPEAT_CHANGED':
            notify({ repeat: msg.repeat ?? 'NONE' });
            break;
        case 'SHUFFLE_CHANGED':
            notify({ shuffle: msg.shuffle ?? false });
            break;
    }
};

const defaultState = {
    song: undefined,
    isPlaying: false,
    muted: false,
    position: 0,
    volume: 100,
    repeat: 'NONE',
    shuffle: false,
    connected: false,
    authRequired: false,
};
const reducer = (state, action) => {
    if (action.type === 'UPDATE')
        return { ...state, ...action.payload };
    return state;
};
const PlayerContext = SP_REACT.createContext(defaultState);
const PlayerProvider = ({ children }) => {
    const [state, dispatch] = SP_REACT.useReducer(reducer, defaultState);
    SP_REACT.useEffect(() => {
        resetAndConnect();
        const removeState = addStateListener((partial) => dispatch({ type: 'UPDATE', payload: partial }));
        const removeAuth = addAuthListener(() => dispatch({ type: 'UPDATE', payload: { authRequired: true } }));
        return () => {
            removeState();
            removeAuth();
            disconnect();
        };
    }, []);
    return SP_JSX.jsx(PlayerContext.Provider, { value: state, children: children });
};
const usePlayer = () => SP_REACT.useContext(PlayerContext);

const Section = ({ title, noPull, children }) => (SP_JSX.jsxs("div", { style: noPull ? undefined : { margin: '0 -12px' }, children: [title && (SP_JSX.jsx("div", { style: {
                padding: noPull ? '12px 0 4px' : '12px 12px 4px',
                fontSize: '11px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                color: 'var(--gpSystemLighterGrey)',
                letterSpacing: '0.04em',
            }, children: title })), children] }));

const NotConnectedView = () => (SP_JSX.jsx(Section, { children: SP_JSX.jsxs("div", { style: { textAlign: 'center', padding: '16px', color: 'var(--gpSystemLighterGrey)' }, children: [SP_JSX.jsx("div", { style: { fontSize: '32px', marginBottom: '8px' }, children: "\uD83C\uDFB5" }), SP_JSX.jsx("div", { style: { fontWeight: 'bold', marginBottom: '8px' }, children: "Not Connected" }), SP_JSX.jsxs("div", { style: { fontSize: '12px', lineHeight: '1.4' }, children: ["Open YouTube Music and enable the ", SP_JSX.jsx("strong", { children: "API Server" }), " plugin in its settings. The plugin will connect automatically."] })] }) }));

const AuthTokenView = () => {
    const [token, setTokenInput] = SP_REACT.useState('');
    const handleSave = () => {
        if (!token.trim())
            return;
        setToken(token.trim());
        disconnect();
        setTimeout(resetAndConnect, 100);
    };
    return (SP_JSX.jsxs(Section, { title: "Authentication Required", children: [SP_JSX.jsx("div", { style: { padding: '8px 16px', fontSize: '12px', color: 'var(--gpSystemLighterGrey)' }, children: "The YouTube Music API server requires a token. Find it in the API Server plugin settings." }), SP_JSX.jsx(DFL.TextField, { label: "API Token", value: token, onChange: (e) => setTokenInput(e.target.value) }), SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: handleSave, disabled: !token.trim(), children: "Save & Connect" })] }));
};

const REPEAT_LABELS = {
    NONE: 'Repeat: Off',
    ALL: 'Repeat: All',
    ONE: 'Repeat: One',
};
const REPEAT_NEXT = { NONE: 1, ALL: 1, ONE: 1 };
const rowBtnFirst = {
    marginLeft: '0px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '0',
    flex: 1,
};
const rowBtn = {
    marginLeft: '5px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '0',
    flex: 1,
};
// Wraps a SliderField in a 12px-padded container and removes Decky's
// hardcoded min-width (270px) by finding the offending element at mount.
const applyInnerPadding = (el) => {
    el.style.paddingLeft = '12px';
    el.style.paddingRight = '12px';
};
const PaddedButton$1 = (props) => {
    const ref = SP_REACT.useRef(null);
    SP_REACT.useEffect(() => {
        const first = ref.current?.firstElementChild;
        if (first)
            applyInnerPadding(first);
    }, []);
    return SP_JSX.jsx("div", { ref: ref, children: SP_JSX.jsx(DFL.ButtonItem, { ...props }) });
};
const PaddedToggle = (props) => {
    const ref = SP_REACT.useRef(null);
    SP_REACT.useEffect(() => {
        const first = ref.current?.firstElementChild;
        if (first)
            applyInnerPadding(first);
    }, []);
    return SP_JSX.jsx("div", { ref: ref, children: SP_JSX.jsx(DFL.ToggleField, { ...props }) });
};
const PaddedSlider = (props) => {
    const ref = SP_REACT.useRef(null);
    SP_REACT.useEffect(() => {
        if (!ref.current)
            return;
        const firstChild = ref.current.firstElementChild;
        if (firstChild) {
            firstChild.style.paddingLeft = '10px';
            firstChild.style.paddingRight = '10px';
        }
        ref.current.querySelectorAll('*').forEach((el) => {
            if (parseFloat(window.getComputedStyle(el).minWidth) >= 270)
                el.style.minWidth = '0';
        });
    }, []);
    return (SP_JSX.jsx("div", { ref: ref, children: SP_JSX.jsx(DFL.SliderField, { ...props }) }));
};
// Module-level cache — survives PlayerView unmount/remount when the user
// switches tabs, so the slider restores the last known value rather than
// whatever the context (potentially stale) reports at remount time.
let _cachedVolume = null;
let _cachedMuted = null;
const PlayerView = () => {
    const { song, isPlaying, volume, muted, shuffle: isShuffled, repeat, position, connected } = usePlayer();
    // Local display state for the volume slider.
    // Problems solved:
    //   1. Touch drag fires onChange rapidly; multiple API calls come back via WebSocket
    //      out of order and snap the slider to stale values mid-drag.
    //   2. D-pad presses jump because WebSocket resets displayVolume between presses.
    //   3. muted from context forced value=0, making every d-pad press compute from 0
    //      so the slider could never increase beyond 1 step.
    //   4. 500ms cooldown was shorter than the API round-trip, letting stale WebSocket
    //      events snap the slider back after the cooldown expired.
    //   5. PLAYER_INFO messages with undefined volume defaulted to 100, corrupting
    //      context on tab switch. Fixed in websocketService + cached here as backup.
    //
    // Fix: block WebSocket syncs while adjusting (+ 1500ms cooldown after last change),
    // always pass displayVolume (not muted?0) as the slider value so d-pad computes
    // from the real level, and track displayMuted locally so the label/button stay
    // correct without letting the WebSocket muted field interfere with the slider.
    const [displayVolume, setDisplayVolume] = SP_REACT.useState(() => _cachedVolume ?? volume);
    const [displayMuted, setDisplayMuted] = SP_REACT.useState(() => _cachedMuted ?? muted);
    const adjustingRef = SP_REACT.useRef(false);
    const cooldownTimer = SP_REACT.useRef(null);
    const debounceTimer = SP_REACT.useRef(null);
    // The WebSocket `volume` field is unreliable for display — it appears to come
    // from a different source/scale than the 0-100 value the API accepts and the
    // app displays (e.g. the user sets 55, app shows 55, WebSocket reports 24).
    // Syncing displayVolume from the WebSocket would corrupt the slider.
    //
    // Fetch the real volume via HTTP whenever connected. This covers both first
    // load (no cached value) and reconnections after YouTube Music restarts
    // (where _cachedVolume from the previous session would otherwise be stale).
    SP_REACT.useEffect(() => {
        if (!connected)
            return;
        void getVolume().then((res) => {
            if (res !== null && !adjustingRef.current) {
                _cachedVolume = res.state;
                setDisplayVolume(res.state);
            }
        });
    }, [connected]);
    // muted is a simple boolean — keep it in sync with context (no scale issue).
    SP_REACT.useEffect(() => {
        if (!adjustingRef.current) {
            _cachedMuted = muted;
            setDisplayMuted(muted);
        }
    }, [muted]);
    // Cleanup timers on unmount.
    SP_REACT.useEffect(() => () => {
        if (cooldownTimer.current)
            clearTimeout(cooldownTimer.current);
        if (debounceTimer.current)
            clearTimeout(debounceTimer.current);
    }, []);
    const handleVolumeChange = (val) => {
        adjustingRef.current = true;
        _cachedVolume = val;
        setDisplayVolume(val);
        // Keep adjustingRef true for 1500ms so the muted WebSocket sync and the
        // mount-time getVolume() fetch don't overwrite the user's in-flight value.
        if (cooldownTimer.current)
            clearTimeout(cooldownTimer.current);
        cooldownTimer.current = setTimeout(() => { adjustingRef.current = false; }, 1500);
        // Debounce the API call — only fire after 300ms of no further changes.
        if (debounceTimer.current)
            clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => { void setVolume(val); }, 300);
    };
    const albumArt = song?.albumArt;
    const title = song?.title ?? 'Nothing playing';
    const artist = song?.artist ?? '';
    const duration = song?.songDuration ?? 0;
    return (SP_JSX.jsxs(SP_JSX.Fragment, { children: [albumArt && (SP_JSX.jsx(Section, { children: SP_JSX.jsx("div", { style: { display: 'flex', justifyContent: 'center', padding: '8px 0' }, children: SP_JSX.jsx("img", { src: albumArt, alt: "Album art", style: { width: '100%', maxWidth: '180px', borderRadius: '8px' } }) }) })), SP_JSX.jsxs(Section, { children: [SP_JSX.jsxs("div", { style: { textAlign: 'center', padding: '8px 0' }, children: [SP_JSX.jsx("div", { style: { fontWeight: 'bold', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, children: title }), artist && (SP_JSX.jsx("div", { style: { fontSize: '11px', color: 'var(--gpSystemLighterGrey)', marginTop: '2px' }, children: artist }))] }), duration > 0 && (SP_JSX.jsx(PaddedSlider, { label: "", value: position, min: 0, max: duration, step: 1, onChange: (val) => { void seekTo(val); }, showValue: false }))] }), SP_JSX.jsx(Section, { title: "Controls", noPull: true, children: DFL.DialogButton ? (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsxs(DFL.Focusable, { style: { display: 'flex', marginTop: '4px', marginBottom: '4px' }, "flow-children": "horizontal", children: [SP_JSX.jsx(DFL.DialogButton, { style: rowBtnFirst, onClick: () => { void previous(); }, children: "\u23EE" }), SP_JSX.jsx(DFL.DialogButton, { style: rowBtn, onClick: () => { void togglePlay(); }, children: isPlaying ? '⏸' : '▶' }), SP_JSX.jsx(DFL.DialogButton, { style: rowBtn, onClick: () => { void next(); }, children: "\u23ED" })] }), SP_JSX.jsxs(DFL.Focusable, { style: { display: 'flex', marginTop: '4px', marginBottom: '4px' }, "flow-children": "horizontal", children: [SP_JSX.jsx(DFL.DialogButton, { style: rowBtnFirst, onClick: () => { void like(); }, children: "\uD83D\uDC4D Like" }), SP_JSX.jsx(DFL.DialogButton, { style: rowBtn, onClick: () => { void dislike(); }, children: "\uD83D\uDC4E Dislike" })] })] })) : (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsx(DFL.ButtonItem, { onClick: () => { void previous(); }, children: "\u23EE Previous" }), SP_JSX.jsx(DFL.ButtonItem, { onClick: () => { void togglePlay(); }, children: isPlaying ? '⏸ Pause' : '▶ Play' }), SP_JSX.jsx(DFL.ButtonItem, { onClick: () => { void next(); }, children: "\u23ED Next" }), SP_JSX.jsx(DFL.ButtonItem, { onClick: () => { void like(); }, children: "\uD83D\uDC4D Like" }), SP_JSX.jsx(DFL.ButtonItem, { onClick: () => { void dislike(); }, children: "\uD83D\uDC4E Dislike" })] })) }), SP_JSX.jsxs(Section, { title: "Volume", children: [SP_JSX.jsx(PaddedSlider, { label: displayMuted ? 'Muted' : `${Math.round(displayVolume)}%`, value: displayVolume, min: 0, max: 100, step: 1, onChange: handleVolumeChange, showValue: false }), SP_JSX.jsx(PaddedButton$1, { onClick: () => { void toggleMute(); }, children: displayMuted ? '🔇 Unmute' : '🔊 Mute' })] }), SP_JSX.jsxs(Section, { title: "Playback", children: [SP_JSX.jsx(PaddedToggle, { label: "Shuffle", checked: isShuffled, onChange: () => { void shuffle(); } }), SP_JSX.jsx(PaddedButton$1, { onClick: () => { void switchRepeat(REPEAT_NEXT[repeat] ?? 1); }, children: REPEAT_LABELS[repeat] ?? 'Repeat: Off' })] })] }));
};

const PaddedButton = (props) => {
    const ref = SP_REACT.useRef(null);
    SP_REACT.useEffect(() => {
        const first = ref.current?.firstElementChild;
        if (first) {
            first.style.paddingLeft = '12px';
            first.style.paddingRight = '12px';
        }
    }, []);
    return SP_JSX.jsx("div", { ref: ref, children: SP_JSX.jsx(DFL.ButtonItem, { ...props }) });
};
const getRenderer = (item) => item.playlistPanelVideoRenderer ??
    item.playlistPanelVideoWrapperRenderer?.primaryRenderer?.playlistPanelVideoRenderer;
const QueueView = () => {
    const [queue, setQueue] = SP_REACT.useState([]);
    const [loading, setLoading] = SP_REACT.useState(true);
    const loadQueue = async (silent = false) => {
        if (!silent)
            setLoading(true);
        const data = await getQueue();
        setQueue(data?.items ?? []);
        if (!silent)
            setLoading(false);
    };
    SP_REACT.useEffect(() => { void loadQueue(); }, []);
    const handleJump = async (index) => {
        await setQueueIndex(index);
        void loadQueue(true);
    };
    const handleRemove = async (index) => {
        await removeFromQueue(index);
        void loadQueue(true);
    };
    const handleClear = async () => {
        await clearQueue();
        setQueue([]);
    };
    if (loading) {
        return (SP_JSX.jsx(Section, { children: SP_JSX.jsx("div", { style: { padding: '16px 12px', color: 'var(--gpSystemLighterGrey)', fontSize: '12px' }, children: "Loading queue..." }) }));
    }
    if (queue.length === 0) {
        return (SP_JSX.jsx(Section, { title: "Queue", children: SP_JSX.jsx("div", { style: { padding: '8px 12px', color: 'var(--gpSystemLighterGrey)', fontSize: '12px' }, children: "Queue is empty" }) }));
    }
    return (SP_JSX.jsxs(Section, { title: "Queue", children: [SP_JSX.jsx(PaddedButton, { onClick: () => { void handleClear(); }, children: "Clear Queue" }), queue.map((item, index) => {
                const r = getRenderer(item);
                const title = r?.title?.runs?.[0]?.text ?? 'Unknown';
                const artist = r?.shortBylineText?.runs?.[0]?.text ?? '';
                const isSelected = r?.selected ?? false;
                if (DFL.DialogButton) {
                    return (SP_JSX.jsxs(DFL.Focusable, { style: { display: 'flex', alignItems: 'center', marginTop: '2px', marginBottom: '2px', paddingLeft: '12px', paddingRight: '12px', paddingTop: '4px', paddingBottom: '4px' }, "flow-children": "horizontal", children: [SP_JSX.jsxs(DFL.DialogButton, { style: {
                                    flex: 1,
                                    textAlign: 'left',
                                    height: 'auto',
                                    minHeight: '40px',
                                    padding: '4px 8px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                }, onClick: () => { void handleJump(index); }, children: [SP_JSX.jsx("div", { style: { fontWeight: isSelected ? 'bold' : 'normal', fontSize: '13px' }, children: title }), artist && (SP_JSX.jsx("div", { style: { fontSize: '11px', color: 'var(--gpSystemLighterGrey)', marginTop: '2px' }, children: artist }))] }), SP_JSX.jsx(DFL.DialogButton, { onClick: () => { void handleRemove(index); }, style: {
                                    width: '28px',
                                    height: '28px',
                                    minWidth: '0',
                                    padding: '0',
                                    marginLeft: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }, children: "\u2715" })] }, index));
                }
                // Fallback when DialogButton unavailable
                return (SP_JSX.jsx(DFL.Field, { label: SP_JSX.jsx("span", { style: { fontWeight: isSelected ? 'bold' : 'normal' }, children: title }), description: artist || undefined, onActivate: () => { void handleJump(index); }, onClick: () => { void handleJump(index); }, highlightOnFocus: true, focusable: true, bottomSeparator: "none" }, index));
            })] }));
};

const TabsContainer = () => {
    const [activeTab, setActiveTab] = SP_REACT.useState('player');
    const containerRef = SP_REACT.useRef(null);
    const [height, setHeight] = SP_REACT.useState(500);
    // Height measurement — run once on mount.
    SP_REACT.useEffect(() => {
        if (!containerRef.current)
            return;
        const containerRect = containerRef.current.getBoundingClientRect();
        let el = containerRef.current.parentElement;
        while (el && el !== document.documentElement) {
            const style = window.getComputedStyle(el);
            const oy = style.overflowY;
            if (oy === 'scroll' || oy === 'auto' || oy === 'overlay') {
                const elRect = el.getBoundingClientRect();
                setHeight(elRect.bottom - containerRect.top);
                return;
            }
            el = el.parentElement;
        }
        setHeight(window.innerHeight - containerRect.top);
    }, []);
    // Adjust Decky Tabs layout on mount and every tab switch.
    SP_REACT.useEffect(() => {
        // Zero the content scroll container's injected left/right padding.
        document.querySelectorAll('[class*="TabContentsScroll"]').forEach((el) => {
            el.style.paddingLeft = '0';
            el.style.paddingRight = '0';
        });
        // Shrink the tab bar row height.
        document.querySelectorAll('[class*="TabHeaderRowWrapper"]').forEach((el) => {
            el.style.minHeight = '32px';
        });
        // Scale down the L1/R1 glyph icons.
        document.querySelectorAll('[class*="Glyphs"]').forEach((el) => {
            el.style.transform = 'scale(0.65)';
            el.style.transformOrigin = 'center center';
        });
    }, [activeTab]);
    return (SP_JSX.jsx("div", { ref: containerRef, style: { height }, children: SP_JSX.jsx(DFL.Tabs, { activeTab: activeTab, onShowTab: (tabID) => setActiveTab(tabID), tabs: [
                { id: 'player', title: 'Player', content: SP_JSX.jsx(PlayerView, {}) },
                { id: 'queue', title: 'Queue', content: SP_JSX.jsx(QueueView, {}) },
            ] }) }));
};
const PluginContent = () => {
    const { connected, authRequired } = usePlayer();
    const [activeTab, setActiveTab] = SP_REACT.useState('player');
    if (!connected)
        return SP_JSX.jsx(NotConnectedView, {});
    if (authRequired)
        return SP_JSX.jsx(AuthTokenView, {});
    if (!DFL.Tabs) {
        return (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsx(Section, { children: ['player', 'queue'].map((id) => (SP_JSX.jsx(DFL.ButtonItem, { onClick: () => setActiveTab(id), children: activeTab === id
                            ? `▶ ${id.charAt(0).toUpperCase() + id.slice(1)}`
                            : id.charAt(0).toUpperCase() + id.slice(1) }, id))) }), activeTab === 'player' && SP_JSX.jsx(PlayerView, {}), activeTab === 'queue' && SP_JSX.jsx(QueueView, {})] }));
    }
    return SP_JSX.jsx(TabsContainer, {});
};
const Content = () => (SP_JSX.jsx(PlayerProvider, { children: SP_JSX.jsx(PluginContent, {}) }));
var index = definePlugin(() => ({
    name: 'YouTube Music',
    titleView: SP_JSX.jsx("div", { className: DFL.staticClasses.Title, children: "YouTube Music" }),
    content: SP_JSX.jsx(Content, {}),
    icon: SP_JSX.jsx(FaMusic, {}),
    onDismount() { },
}));

export { index as default };
//# sourceMappingURL=index.js.map
