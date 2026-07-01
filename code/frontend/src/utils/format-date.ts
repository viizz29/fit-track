export function formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    };

    const formatter = new Intl.DateTimeFormat('en-US', options);
    const formattedDate = formatter.format(date).replace(',', ''); // Remove the comma
    return formattedDate.replace(/(\d{2}) (\w{3})/, '$1 $2'); // Adjust format if necessary
}
