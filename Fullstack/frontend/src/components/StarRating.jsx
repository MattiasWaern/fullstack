export default function StarRating({rating, onRate, size = 'md'}){
    const stars = [1, 2, 3, 4, 5];
    const sizeClass = size === 'lg' ? 'text-2x1' : text-lg;


    return (
        <div className="flex gap-0.5">
            {stars.map(star => (
                <span
                    key={star}
                    className={`${sizeClass} ${onRate} ? 'cursor.pointer' : ''} transition-colors `}
                    onClick={() => onRate && onRate(star)}
                    style={{color: star <= rating ? '#e8871a' : '#d4c5a9'}}
                >
                    ★
                </span>
            ))}
        </div>
    );
}