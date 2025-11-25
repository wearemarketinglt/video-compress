export const formatDate = (date, expire = 0, include_seconds = false) => {
    const pad = (n) => n.toString().padStart(2, '0');
    const adjustedDate = new Date(date);
    adjustedDate.setMonth(adjustedDate.getMonth() + expire);

    const year = adjustedDate.getFullYear();
    const month = pad(adjustedDate.getMonth() + 1);
    const day = pad(adjustedDate.getDate());
    const hours = pad(adjustedDate.getHours());
    const minutes = pad(adjustedDate.getMinutes());
    const seconds = pad(adjustedDate.getSeconds());
    return `${year}-${month}-${day} ${hours}:${minutes}${include_seconds ? `:${seconds}` : ''}`;
};

export const dateAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 1000 / 60);
    const hours = Math.floor(diff / 1000 / 60 / 60);
    const days = Math.floor(diff / 1000 / 60 / 60 / 24);
    const months = Math.floor(diff / 1000 / 60 / 60 / 24 / 30);
    const years = Math.floor(diff / 1000 / 60 / 60 / 24 / 365);

    switch (true) {
        case minutes < 1:
            return `less than a minute ago`;
        case minutes === 1:
            return `1 minute ago`;
        case minutes < 60:
            return `${minutes} minutes ago`;
        case hours === 1:
            return `1 hour ago`;
        case hours < 24:
            return `${hours} hours ago`;
        case days === 1:
            return `1 day ago`;
        case days <= 14:
            return `${days} days ago`;
        case days < 30:
            return `more than 2 weeks ago`;
        case months === 1:
            return `1 month ago`;
        case months < 12:
            return `${months} months ago`;
        case years === 1:
            return `1 year ago`;
        default:
            return `${years} years ago`;
    }
}