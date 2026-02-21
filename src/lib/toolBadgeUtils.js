import { copyToClipboard } from "./copyToClipboard"

export const getTextToCopy = (name, args, label) => {
    if (!args || typeof args !== 'object' || !Object.keys(args).length) return label
    if (name === 'subagent') {
        const { task } = args || {}

        if (task) return task
        return JSON.stringify({ name, args })
    }
    const { command, cmd, path, directory, dir, url, query, prompt } = args
    return command || cmd || path || directory || dir || url || query || prompt
        || JSON.stringify({ name, args })
}

export const tryOpenUrl = (name, args) => {
    if (name === 'web_fetch' && args?.url) return args.url
    if (name === 'web_search' && args?.query)
        return `https://www.google.com/search?q=${encodeURIComponent(args.query)}`
    return null
}
export { copyToClipboard }