export interface ConfigInterface {
    reddit: {
        client_id: string,
        uri: string
        duration: string
        scope: Array<string>
    }
}

export const config = {
    reddit: {
        client_id: '',
        uri: '',
        duration: '', // temporary | permanent
        scope: [

        ].join(' ')
    }
}