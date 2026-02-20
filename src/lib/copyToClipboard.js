export async function copyToClipboard(text) {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        try {
            await navigator.clipboard.writeText(text)
            return true
        } catch (e) {
            console.error('Clipboard API failed, falling back to execCommand:', e)
        }
    }

    try {
        return await new Promise((resolve) => {
            try {
                const ta = document.createElement('textarea')
                ta.value = text
                ta.style.position = 'fixed'
                ta.style.left = '-9999px'
                document.body.appendChild(ta)
                ta.focus()
                ta.select()
                const ok = document.execCommand && document.execCommand('copy')
                document.body.removeChild(ta)
                resolve(Boolean(ok))
            } catch (e) {
                resolve(false)
            }
        })
    } catch (e) {
        return false
    }
}
