import { useState, useEffect } from 'react';


export const TypeWriter = ({ words }) => {
  const [index, setIndex] = useState(0); // Vị trí của từ hiện tại trong mảng
  const [subIndex, setSubIndex] = useState(0); // Vị trí ký tự đang gõ
  const [reverse, setReverse] = useState(false); // Trạng thái: false = đang gõ, true = đang xóa
  const [blink, setBlink] = useState(true); // Trạng thái con trỏ

  // Logic gõ chữ
  useEffect(() => {
    if (index === words.length) return; // Phòng hờ

    if ( subIndex === words[index].length + 1 && !reverse ) {
        // Đã gõ xong từ hiện tại, chờ một chút rồi xóa
        setReverse(true);
        return;
    }

    if (subIndex === 0 && reverse) {
        // Đã xóa xong, chuyển sang từ tiếp theo
        setReverse(false);
        setIndex((prev) => (prev + 1) % words.length); // Loop lại từ đầu
        return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (reverse ? -1 : 1));
    }, reverse ? 75 : 150); // Tốc độ: Xóa nhanh (75ms), Gõ bình thường (150ms)

    // Logic chờ khi gõ xong 1 từ
    if (subIndex === words[index].length && !reverse) {
        // Dừng lại lâu hơn một chút khi gõ xong để người dùng đọc
        return () => clearTimeout(timeout); 
    }

    return () => clearTimeout(timeout);
  }, [subIndex, index, reverse, words]);

  // Logic cho con trỏ nhấp nháy
  useEffect(() => {
    const timeout2 = setTimeout(() => {
      setBlink((prev) => !prev);
    }, 500);
    return () => clearTimeout(timeout2);
  }, [blink]);

  return (
    <span className="font-mono text-lg md:text-xl lg:text-2xl font-bold">
      {`${words[index].substring(0, subIndex)}`}
      <span className={`cursor-blink ${blink ? 'opacity-100' : 'opacity-0'}`}>&nbsp;</span>
    </span>
  );
};

