export interface TwitchMessage {
    metadata: Metadata
    payload: Payload
}

export interface TwitchTokenValidateResponse {
    client_id: string
    login: string
    scopes: string[]
    user_id: string
    expires_in: number
}

export interface TwitchSubscriptionRequest {
    type: string
    version: string
    condition: Condition
    transport: Transport
}

export interface TwitchChatMessage {
    broadcaster_user_id: string
    broadcaster_user_login: string
    broadcaster_user_name: string
    chatter_user_id: string
    chatter_user_login: string
    chatter_user_name: string
    message_id: string
    message: Message
    color: string
    badges: Badge[]
    message_type: string
    cheer: any
    reply: any
    channel_points_custom_reward_id: any
    source_broadcaster_user_id: any
    source_broadcaster_user_login: any
    source_broadcaster_user_name: any
    source_message_id: any
    source_badges: any
}

/////////////////////////////////////////////////////

export interface Metadata {
    message_id: string
    message_type: string
    message_timestamp: string
    subscription_type: string
    subscription_version: string
}

export interface Payload {
    session: Session
    event: Event
}

export interface Session {
    id: string
    status: string
    connected_at: string
    keepalive_timeout_seconds: number
    reconnect_url: any
}

export interface Condition {
    broadcaster_user_id: string
    user_id: string
}

export interface Transport {
    method: string
    session_id: string;
}

export interface Condition {
    broadcaster_user_id: string
    user_id: string
}

export interface Transport {
    method: string
    session_id: string
}

export type Event = TwitchChatMessage

export interface Message {
    text: string
    fragments: Fragment[]
}

export interface Fragment {
    type: string
    text: string
    cheermote: Cheermote
    emote: Emote
    mention: Mention
}

export interface Badge {
    set_id: string
    id: string
    info: string
}

export interface Cheermote {
    prefix: string;
    bits: number;
    tier: number;
}

export interface Emote {
    id: string;
    emote_set_id: string;
    owner_id: string;
    format: string[];
}

export interface Mention {
    user_id: string;
    user_name: string;
    user_login: string;
}
