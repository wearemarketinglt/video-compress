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