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
function FaVolumeUp (props) {
  return GenIcon({"attr":{"viewBox":"0 0 576 512"},"child":[{"tag":"path","attr":{"d":"M215.03 71.05L126.06 160H24c-13.26 0-24 10.74-24 24v144c0 13.25 10.74 24 24 24h102.06l88.97 88.95c15.03 15.03 40.97 4.47 40.97-16.97V88.02c0-21.46-25.96-31.98-40.97-16.97zm233.32-51.08c-11.17-7.33-26.18-4.24-33.51 6.95-7.34 11.17-4.22 26.18 6.95 33.51 66.27 43.49 105.82 116.6 105.82 195.58 0 78.98-39.55 152.09-105.82 195.58-11.17 7.32-14.29 22.34-6.95 33.5 7.04 10.71 21.93 14.56 33.51 6.95C528.27 439.58 576 351.33 576 256S528.27 72.43 448.35 19.97zM480 256c0-63.53-32.06-121.94-85.77-156.24-11.19-7.14-26.03-3.82-33.12 7.46s-3.78 26.21 7.41 33.36C408.27 165.97 432 209.11 432 256s-23.73 90.03-63.48 115.42c-11.19 7.14-14.5 22.07-7.41 33.36 6.51 10.36 21.12 15.14 33.12 7.46C447.94 377.94 480 319.54 480 256zm-141.77-76.87c-11.58-6.33-26.19-2.16-32.61 9.45-6.39 11.61-2.16 26.2 9.45 32.61C327.98 228.28 336 241.63 336 256c0 14.38-8.02 27.72-20.92 34.81-11.61 6.41-15.84 21-9.45 32.61 6.43 11.66 21.05 15.8 32.61 9.45 28.23-15.55 45.77-45 45.77-76.88s-17.54-61.32-45.78-76.86z"},"child":[]}]})(props);
}function FaThumbsUp (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M104 224H24c-13.255 0-24 10.745-24 24v240c0 13.255 10.745 24 24 24h80c13.255 0 24-10.745 24-24V248c0-13.255-10.745-24-24-24zM64 472c-13.255 0-24-10.745-24-24s10.745-24 24-24 24 10.745 24 24-10.745 24-24 24zM384 81.452c0 42.416-25.97 66.208-33.277 94.548h101.723c33.397 0 59.397 27.746 59.553 58.098.084 17.938-7.546 37.249-19.439 49.197l-.11.11c9.836 23.337 8.237 56.037-9.308 79.469 8.681 25.895-.069 57.704-16.382 74.757 4.298 17.598 2.244 32.575-6.148 44.632C440.202 511.587 389.616 512 346.839 512l-2.845-.001c-48.287-.017-87.806-17.598-119.56-31.725-15.957-7.099-36.821-15.887-52.651-16.178-6.54-.12-11.783-5.457-11.783-11.998v-213.77c0-3.2 1.282-6.271 3.558-8.521 39.614-39.144 56.648-80.587 89.117-113.111 14.804-14.832 20.188-37.236 25.393-58.902C282.515 39.293 291.817 0 312 0c24 0 72 8 72 81.452z"},"child":[]}]})(props);
}function FaThumbsDown (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M0 56v240c0 13.255 10.745 24 24 24h80c13.255 0 24-10.745 24-24V56c0-13.255-10.745-24-24-24H24C10.745 32 0 42.745 0 56zm40 200c0-13.255 10.745-24 24-24s24 10.745 24 24-10.745 24-24 24-24-10.745-24-24zm272 256c-20.183 0-29.485-39.293-33.931-57.795-5.206-21.666-10.589-44.07-25.393-58.902-32.469-32.524-49.503-73.967-89.117-113.111a11.98 11.98 0 0 1-3.558-8.521V59.901c0-6.541 5.243-11.878 11.783-11.998 15.831-.29 36.694-9.079 52.651-16.178C256.189 17.598 295.709.017 343.995 0h2.844c42.777 0 93.363.413 113.774 29.737 8.392 12.057 10.446 27.034 6.148 44.632 16.312 17.053 25.063 48.863 16.382 74.757 17.544 23.432 19.143 56.132 9.308 79.469l.11.11c11.893 11.949 19.523 31.259 19.439 49.197-.156 30.352-26.157 58.098-59.553 58.098H350.723C358.03 364.34 384 388.132 384 430.548 384 504 336 512 312 512z"},"child":[]}]})(props);
}function FaStepForward (props) {
  return GenIcon({"attr":{"viewBox":"0 0 448 512"},"child":[{"tag":"path","attr":{"d":"M384 44v424c0 6.6-5.4 12-12 12h-48c-6.6 0-12-5.4-12-12V291.6l-195.5 181C95.9 489.7 64 475.4 64 448V64c0-27.4 31.9-41.7 52.5-24.6L312 219.3V44c0-6.6 5.4-12 12-12h48c6.6 0 12 5.4 12 12z"},"child":[]}]})(props);
}function FaStepBackward (props) {
  return GenIcon({"attr":{"viewBox":"0 0 448 512"},"child":[{"tag":"path","attr":{"d":"M64 468V44c0-6.6 5.4-12 12-12h48c6.6 0 12 5.4 12 12v176.4l195.5-181C352.1 22.3 384 36.6 384 64v384c0 27.4-31.9 41.7-52.5 24.6L136 292.7V468c0 6.6-5.4 12-12 12H76c-6.6 0-12-5.4-12-12z"},"child":[]}]})(props);
}function FaRandom (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M504.971 359.029c9.373 9.373 9.373 24.569 0 33.941l-80 79.984c-15.01 15.01-40.971 4.49-40.971-16.971V416h-58.785a12.004 12.004 0 0 1-8.773-3.812l-70.556-75.596 53.333-57.143L352 336h32v-39.981c0-21.438 25.943-31.998 40.971-16.971l80 79.981zM12 176h84l52.781 56.551 53.333-57.143-70.556-75.596A11.999 11.999 0 0 0 122.785 96H12c-6.627 0-12 5.373-12 12v56c0 6.627 5.373 12 12 12zm372 0v39.984c0 21.46 25.961 31.98 40.971 16.971l80-79.984c9.373-9.373 9.373-24.569 0-33.941l-80-79.981C409.943 24.021 384 34.582 384 56.019V96h-58.785a12.004 12.004 0 0 0-8.773 3.812L96 336H12c-6.627 0-12 5.373-12 12v56c0 6.627 5.373 12 12 12h110.785c3.326 0 6.503-1.381 8.773-3.812L352 176h32z"},"child":[]}]})(props);
}function FaPlay (props) {
  return GenIcon({"attr":{"viewBox":"0 0 448 512"},"child":[{"tag":"path","attr":{"d":"M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z"},"child":[]}]})(props);
}function FaPause (props) {
  return GenIcon({"attr":{"viewBox":"0 0 448 512"},"child":[{"tag":"path","attr":{"d":"M144 479H48c-26.5 0-48-21.5-48-48V79c0-26.5 21.5-48 48-48h96c26.5 0 48 21.5 48 48v352c0 26.5-21.5 48-48 48zm304-48V79c0-26.5-21.5-48-48-48h-96c-26.5 0-48 21.5-48 48v352c0 26.5 21.5 48 48 48h96c26.5 0 48-21.5 48-48z"},"child":[]}]})(props);
}function FaMusic (props) {
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
const setVolume = (volume) => post('/volume', { volume });
const shuffle = () => post('/shuffle');
const switchRepeat = (iteration) => post('/switch-repeat', { iteration });
const like = () => post('/like');
const dislike = () => post('/dislike');
// Song & state
const getSongInfo = async () => {
    const info = await get('/song');
    if (!info)
        return null;
    // Companion API uses imageSrc; normalise to albumArt for internal use.
    if (!info.albumArt && info.imageSrc)
        info.albumArt = info.imageSrc;
    return info;
};
const getVolume = () => get('/volume');
// Queue
const getQueue = () => get('/queue');
const removeFromQueue = (index) => del(`/queue/${index}`);
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
            const update = {};
            if (msg.volume !== undefined)
                update.volume = msg.volume;
            if (msg.muted !== undefined)
                update.muted = msg.muted;
            if (Object.keys(update).length > 0)
                notify(update);
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
    // Supplement WebSocket song data with HTTP response when the song changes.
    // The WS payload often omits albumArt; GET /api/v1/song always includes it.
    SP_REACT.useEffect(() => {
        if (!state.connected)
            return;
        let cancelled = false;
        void getSongInfo().then((info) => {
            if (!cancelled && info)
                dispatch({ type: 'UPDATE', payload: { song: info } });
        });
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- dispatch is stable; intentionally omit to avoid extra fetches
    }, [state.song?.videoId, state.connected]);
    return SP_JSX.jsx(PlayerContext.Provider, { value: state, children: children });
};
const usePlayer = () => SP_REACT.useContext(PlayerContext);

const Section = ({ title, noPull, children }) => (SP_JSX.jsxs("div", { style: noPull ? undefined : { margin: '0 -10px' }, children: [title && (SP_JSX.jsx("div", { style: {
                padding: noPull ? '12px 0 4px' : '12px 12px 4px',
                fontSize: '11px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                color: 'var(--gpSystemLighterGrey)',
                letterSpacing: '0.04em',
            }, children: title })), children] }));

const NotConnectedView = () => (SP_JSX.jsx(Section, { children: SP_JSX.jsxs("div", { style: { textAlign: 'center', padding: '16px', color: 'var(--gpSystemLighterGrey)' }, children: [SP_JSX.jsx("div", { style: { fontSize: '32px', marginBottom: '8px' }, children: SP_JSX.jsx(FaMusic, { size: 32 }) }), SP_JSX.jsx("div", { style: { fontWeight: 'bold', marginBottom: '8px' }, children: "Not Connected" }), SP_JSX.jsxs("div", { style: { fontSize: '12px', lineHeight: '1.4' }, children: ["Open YouTube Music and enable the ", SP_JSX.jsx("strong", { children: "API Server" }), " plugin in its settings. The plugin will connect automatically."] })] }) }));

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

// THIS FILE IS AUTO GENERATED
function MdRepeatOne (props) {
  return GenIcon({"attr":{"viewBox":"0 0 24 24"},"child":[{"tag":"path","attr":{"fill":"none","d":"M0 0h24v24H0z"},"child":[]},{"tag":"path","attr":{"d":"M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z"},"child":[]}]})(props);
}function MdRepeat (props) {
  return GenIcon({"attr":{"viewBox":"0 0 24 24"},"child":[{"tag":"path","attr":{"fill":"none","d":"M0 0h24v24H0z"},"child":[]},{"tag":"path","attr":{"d":"M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"},"child":[]}]})(props);
}

// How often to poll YTM for the current volume.
// Keeps the slider in sync whether or not the component remounts.
const POLL_MS = 2000;
// After the user moves the slider, suppress poll updates for this long
// so the slider doesn't jump back while the API call is in flight.
const USER_ADJUST_GRACE_MS = 1500;
const PaddedSlider = (props) => {
    const ref = SP_REACT.useRef(null);
    SP_REACT.useEffect(() => {
        if (!ref.current)
            return;
        const firstChild = ref.current.firstElementChild;
        if (firstChild) {
            firstChild.style.paddingLeft = '19px';
            firstChild.style.paddingRight = '19px';
        }
        ref.current.querySelectorAll('*').forEach((el) => {
            if (parseFloat(window.getComputedStyle(el).minWidth) >= 270)
                el.style.minWidth = '0';
        });
    }, []);
    return (SP_JSX.jsx("div", { ref: ref, children: SP_JSX.jsx(DFL.SliderField, { ...props }) }));
};
const VolumeSlider = () => {
    const [volume, setVolumeState] = SP_REACT.useState(null);
    // True while the user is actively adjusting — poll won't overwrite their value.
    const userAdjustingRef = SP_REACT.useRef(false);
    const userAdjustTimerRef = SP_REACT.useRef(null);
    const apiDebounceRef = SP_REACT.useRef(null);
    const fetchVolume = SP_REACT.useCallback(async () => {
        if (userAdjustingRef.current) {
            console.log('[VolumeSlider] poll skipped — user is adjusting');
            return;
        }
        console.log('[VolumeSlider] fetching volume from API');
        const res = await getVolume();
        if (res !== null) {
            console.log('[VolumeSlider] got volume:', res.state, '| muted:', res.isMuted);
            setVolumeState(res.state);
        }
        else {
            console.log('[VolumeSlider] fetch returned null (API unreachable?)');
        }
    }, []);
    SP_REACT.useEffect(() => {
        console.log('[VolumeSlider] mount — starting poll every', POLL_MS, 'ms');
        void fetchVolume();
        const interval = setInterval(() => { void fetchVolume(); }, POLL_MS);
        return () => {
            console.log('[VolumeSlider] unmount — stopping poll');
            clearInterval(interval);
        };
    }, [fetchVolume]);
    const handleChange = (val) => {
        setVolumeState(val);
        // Mark user as adjusting so polls don't overwrite the slider.
        userAdjustingRef.current = true;
        if (userAdjustTimerRef.current)
            clearTimeout(userAdjustTimerRef.current);
        userAdjustTimerRef.current = setTimeout(() => {
            userAdjustingRef.current = false;
        }, USER_ADJUST_GRACE_MS);
        // Debounce the actual API call.
        if (apiDebounceRef.current)
            clearTimeout(apiDebounceRef.current);
        apiDebounceRef.current = setTimeout(() => {
            console.log('[VolumeSlider] calling setVolume ->', val);
            void setVolume(val);
        }, 300);
    };
    if (volume === null) {
        return (SP_JSX.jsx(PaddedSlider, { icon: SP_JSX.jsx(FaVolumeUp, { size: 18 }), value: 0, min: 0, max: 100, step: 1, onChange: () => { }, disabled: true, showValue: false }));
    }
    return (SP_JSX.jsx(PaddedSlider, { icon: SP_JSX.jsx(FaVolumeUp, { size: 18 }), value: volume, min: 0, max: 100, step: 1, onChange: handleChange, showValue: false }));
};

const REPEAT_NEXT = { NONE: 1, ALL: 1, ONE: 1 };
const REPEAT_ICONS = {
    NONE: SP_JSX.jsx(MdRepeat, { size: 18, style: { opacity: 0.4, margin: '-2px' } }),
    ALL: SP_JSX.jsx(MdRepeat, { size: 18, style: { opacity: 1, margin: '-2px' } }),
    ONE: SP_JSX.jsx(MdRepeatOne, { size: 18, style: { opacity: 1, margin: '-2px' } }),
};
const REPEAT_LABELS = {
    NONE: 'Off',
    ALL: 'All',
    ONE: 'One',
};
const rowBtnBase = {
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '0',
    flex: 1,
    padding: '0 8px',
    marginLeft: '0',
};
const rowBtnFirst = { ...rowBtnBase, borderRadius: '4px 0 0 4px' };
const rowBtnMid = { ...rowBtnBase, borderRadius: '0', borderLeft: '1px solid rgba(255,255,255,0.15)' };
const rowBtnLast = { ...rowBtnBase, borderRadius: '0 4px 4px 0', borderLeft: '1px solid rgba(255,255,255,0.15)' };
// Applies padding to Decky item elements (buttons, toggles) and removes
// hardcoded min-width (270px) by finding the offending element at mount.
const applyInnerPadding = (el) => {
    el.style.paddingLeft = '19px';
    el.style.paddingRight = '19px';
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
const PlayerView = () => {
    const { song, isPlaying, shuffle: isShuffled, repeat } = usePlayer();
    const albumArt = song?.albumArt;
    const title = song?.title ?? 'Nothing playing';
    const artist = song?.artist ?? '';
    return (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsx(Section, { children: SP_JSX.jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 16px' }, children: [albumArt ? (SP_JSX.jsx("img", { src: albumArt, alt: "Album art", style: { width: '72px', height: '72px', borderRadius: '4px', objectFit: 'cover', flexShrink: 0 } })) : (SP_JSX.jsx("div", { style: {
                                width: '72px', height: '72px', borderRadius: '4px', flexShrink: 0,
                                background: 'rgba(255,255,255,0.08)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--gpSystemLighterGrey)',
                            }, children: SP_JSX.jsx(FaMusic, { size: 36 }) })), SP_JSX.jsxs("div", { style: { display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }, children: [SP_JSX.jsx("div", { style: { fontWeight: 'bold', fontSize: '15px', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, children: title }), artist && (SP_JSX.jsx("div", { style: { fontSize: '12px', color: 'var(--gpSystemLighterGrey)', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, children: artist }))] })] }) }), SP_JSX.jsx("div", { style: { marginTop: '10px', marginBottom: '10px', paddingLeft: '5px', paddingRight: '5px' }, children: SP_JSX.jsx(Section, { noPull: true, children: DFL.DialogButton ? (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsxs(DFL.Focusable, { style: { display: 'flex', marginTop: '4px', marginBottom: '4px' }, "flow-children": "horizontal", children: [SP_JSX.jsx(DFL.DialogButton, { style: rowBtnFirst, onClick: () => { void previous(); }, children: SP_JSX.jsx(FaStepBackward, {}) }), SP_JSX.jsx(DFL.DialogButton, { style: rowBtnMid, onClick: () => { void togglePlay(); }, children: isPlaying ? SP_JSX.jsx(FaPause, {}) : SP_JSX.jsx(FaPlay, {}) }), SP_JSX.jsx(DFL.DialogButton, { style: rowBtnLast, onClick: () => { void next(); }, children: SP_JSX.jsx(FaStepForward, {}) })] }), SP_JSX.jsxs(DFL.Focusable, { style: { display: 'flex', marginTop: '4px', marginBottom: '4px' }, "flow-children": "horizontal", children: [SP_JSX.jsx(DFL.DialogButton, { style: rowBtnFirst, onClick: () => { void like(); }, children: SP_JSX.jsx(FaThumbsUp, {}) }), SP_JSX.jsx(DFL.DialogButton, { style: rowBtnLast, onClick: () => { void dislike(); }, children: SP_JSX.jsx(FaThumbsDown, {}) })] })] })) : (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsxs(DFL.ButtonItem, { onClick: () => { void previous(); }, children: [SP_JSX.jsx(FaStepBackward, {}), " Previous"] }), SP_JSX.jsx(DFL.ButtonItem, { onClick: () => { void togglePlay(); }, children: isPlaying ? SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsx(FaPause, {}), " Pause"] }) : SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsx(FaPlay, {}), " Play"] }) }), SP_JSX.jsxs(DFL.ButtonItem, { onClick: () => { void next(); }, children: [SP_JSX.jsx(FaStepForward, {}), " Next"] }), SP_JSX.jsx(DFL.ButtonItem, { onClick: () => { void like(); }, children: SP_JSX.jsx(FaThumbsUp, {}) }), SP_JSX.jsx(DFL.ButtonItem, { onClick: () => { void dislike(); }, children: SP_JSX.jsx(FaThumbsDown, {}) })] })) }) }), SP_JSX.jsx(Section, { children: SP_JSX.jsx(VolumeSlider, {}) }), SP_JSX.jsxs(Section, { children: [SP_JSX.jsx(PaddedToggle, { label: SP_JSX.jsxs("span", { style: { display: 'flex', alignItems: 'center', gap: '6px' }, children: [SP_JSX.jsx(FaRandom, { size: 14 }), " Shuffle"] }), checked: isShuffled, onChange: () => { void shuffle(); } }), SP_JSX.jsx(DFL.Focusable, { children: SP_JSX.jsxs(DFL.DialogButton, { style: { height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '6px', paddingLeft: '19px', paddingRight: '19px', borderRadius: '0' }, onClick: () => { void switchRepeat(REPEAT_NEXT[repeat] ?? 1); }, children: [REPEAT_ICONS[repeat] ?? REPEAT_ICONS.NONE, "Repeat: ", REPEAT_LABELS[repeat] ?? 'Off'] }) })] })] }));
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
    SP_REACT.useEffect(() => {
        const el = document.createElement('style');
        el.textContent = '.yt-queue-active:not(:focus):not(:focus-within) { background: rgba(255,255,255,0) !important; }';
        document.head.appendChild(el);
        return () => el.remove();
    }, []);
    const handleJump = async (index) => {
        await setQueueIndex(index);
        void loadQueue(true);
    };
    const handleRemove = async (index) => {
        await removeFromQueue(index);
        void loadQueue(true);
    };
    if (loading) {
        return (SP_JSX.jsx(Section, { children: SP_JSX.jsx("div", { style: { padding: '16px 12px', color: 'var(--gpSystemLighterGrey)', fontSize: '12px' }, children: "Loading queue..." }) }));
    }
    if (queue.length === 0) {
        return (SP_JSX.jsx(Section, { children: SP_JSX.jsx("div", { style: { padding: '8px 12px', color: 'var(--gpSystemLighterGrey)', fontSize: '12px' }, children: "Queue is empty" }) }));
    }
    return (SP_JSX.jsx(Section, { children: queue.map((item, index) => {
            const r = getRenderer(item);
            const title = r?.title?.runs?.[0]?.text ?? 'Unknown';
            const artist = r?.shortBylineText?.runs?.[0]?.text ?? '';
            const isSelected = r?.selected ?? false;
            if (DFL.DialogButton) {
                return (SP_JSX.jsxs(DFL.Focusable, { style: { display: 'flex', alignItems: 'stretch', marginTop: '2px', marginBottom: '2px' }, "flow-children": "horizontal", children: [SP_JSX.jsxs(DFL.DialogButton, { className: isSelected ? 'yt-queue-active' : undefined, style: {
                                flex: 1,
                                textAlign: 'left',
                                height: 'auto',
                                minHeight: '44px',
                                padding: '10px 19px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                borderRadius: '0',
                            }, onClick: () => { void handleJump(index); }, children: [SP_JSX.jsx("div", { style: { fontWeight: isSelected ? 'bold' : 'normal', fontSize: '13px' }, children: title }), artist && (SP_JSX.jsx("div", { style: { fontSize: '11px', color: 'var(--gpSystemLighterGrey)', marginTop: '2px' }, children: artist }))] }), SP_JSX.jsx(DFL.DialogButton, { className: isSelected ? 'yt-queue-active' : undefined, onClick: () => { void handleRemove(index); }, style: {
                                width: '36px',
                                minWidth: '0',
                                padding: '0',
                                marginLeft: '0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                borderRadius: '0',
                                borderLeft: '1px solid rgba(255,255,255,0.15)',
                            }, children: "\u2715" })] }, index));
            }
            // Fallback when DialogButton unavailable
            return (SP_JSX.jsx(DFL.Field, { label: SP_JSX.jsx("span", { style: { fontWeight: isSelected ? 'bold' : 'normal' }, children: title }), description: artist || undefined, onActivate: () => { void handleJump(index); }, onClick: () => { void handleJump(index); }, highlightOnFocus: true, focusable: true, bottomSeparator: "none" }, index));
        }) }));
};

const TabsContainer = () => {
    const [activeTab, setActiveTab] = SP_REACT.useState('player');
    const containerRef = SP_REACT.useRef(null);
    const [height, setHeight] = SP_REACT.useState(500);
    // Height measurement — run once on mount. Also locks the outer scroll
    // container (overflow-y: hidden) so touch-scrolling cannot move the entire
    // plugin panel — only TabContentsScroll scrolls independently.
    SP_REACT.useEffect(() => {
        if (!containerRef.current)
            return;
        const containerRect = containerRef.current.getBoundingClientRect();
        let scrollEl = null;
        let el = containerRef.current.parentElement;
        while (el && el !== document.documentElement) {
            const style = window.getComputedStyle(el);
            const oy = style.overflowY;
            if (oy === 'scroll' || oy === 'auto' || oy === 'overlay') {
                const elRect = el.getBoundingClientRect();
                setHeight(elRect.bottom - containerRect.top);
                scrollEl = el;
                break;
            }
            el = el.parentElement;
        }
        if (!scrollEl) {
            setHeight(window.innerHeight - containerRect.top);
            return;
        }
        const prev = scrollEl.style.overflowY;
        scrollEl.style.overflowY = 'hidden';
        return () => { scrollEl.style.overflowY = prev; };
    }, []);
    // Inject CSS on mount to fix tab bar layout and prevent touch scroll jank.
    // Replaces the per-tab-switch querySelectorAll DOM patches.
    SP_REACT.useEffect(() => {
        const el = document.createElement('style');
        el.textContent = `
      /* Cascade flex-column through Decky's wrapper between our div and Tabs DOM. */
      #ytm-container > * {
        height: 100%;
        display: flex;
        flex-direction: column;
        min-height: 0;
      }
      /* Tab bar: scoped, never shrinks. */
      #ytm-container [class*="TabHeaderRowWrapper"] {
        flex-shrink: 0 !important;
        min-height: 32px !important;
        padding-left: 18px !important;
        padding-right: 18px !important;
      }
      /* Content scroll area: scoped, takes remaining height. overflow-y left alone. */
      #ytm-container [class*="TabContentsScroll"] {
        flex: 1 !important;
        min-height: 0 !important;
        padding-left: 0 !important;
        padding-right: 0 !important;
      }
      /* L1/R1 glyph icons: scoped. */
      #ytm-container [class*="Glyphs"] {
        transform: scale(0.65) !important;
        transform-origin: center center !important;
      }
    `;
        document.head.appendChild(el);
        return () => el.remove();
    }, []);
    return (SP_JSX.jsx("div", { id: "ytm-container", ref: containerRef, style: { height, overflow: 'hidden' }, children: SP_JSX.jsx(DFL.Tabs, { activeTab: activeTab, onShowTab: (tabID) => setActiveTab(tabID), tabs: [
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
const Content = () => {
    SP_REACT.useEffect(() => {
        const titleEl = document.querySelector(`.${DFL.staticClasses.Title}`);
        if (titleEl?.parentElement) {
            titleEl.parentElement.style.gap = '0';
        }
    }, []);
    return (SP_JSX.jsx(PlayerProvider, { children: SP_JSX.jsx(PluginContent, {}) }));
};
var index = definePlugin(() => ({
    name: 'YouTube Music',
    titleView: SP_JSX.jsx("div", { className: DFL.staticClasses.Title, style: { paddingTop: '0', boxShadow: 'none' }, children: "YouTube Music" }),
    content: SP_JSX.jsx(Content, {}),
    icon: SP_JSX.jsx(FaMusic, {}),
    onDismount() { },
}));

export { index as default };
//# sourceMappingURL=index.js.map
