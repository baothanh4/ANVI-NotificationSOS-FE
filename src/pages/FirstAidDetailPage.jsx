import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, CheckCircle2, Info, Clock, Phone } from 'lucide-react';

export const FirstAidDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const firstAidData = {
    cpr: {
      title: 'HỒI SỨC TIM PHỔI (CPR)',
      overview: 'Hồi sức tim phổi (CPR) là kỹ thuật cấp cứu kết hợp ấn ngực và hà hơi thổi ngạt để duy trì lưu thông máu và oxy lên não khi tim ngừng đập.',
      steps: [
        'Kiểm tra hiện trường: Đảm bảo khu vực an toàn cho cả bạn và nạn nhân.',
        'Kiểm tra phản ứng: Vỗ nhẹ vào vai và gọi to để xem nạn nhân có tỉnh táo không.',
        'Gọi cấp cứu 115: Nếu nạn nhân không phản ứng, hãy gọi ngay lực lượng y tế.',
        'Kiểm tra nhịp thở: Quan sát lồng ngực trong 5-10 giây.',
        'Ấn ngực: Đặt hai tay lên giữa ngực nạn nhân, ấn sâu 5-6cm với tốc độ 100-120 lần/phút.',
        'Hà hơi thổi ngạt: Sau mỗi 30 lần ấn ngực, thực hiện 2 lần thổi ngạt (nếu được đào tạo).'
      ],
      warnings: [
        'Không ấn ngực nếu nạn nhân còn tỉnh táo hoặc còn thở bình thường.',
        'Không ngừng ấn ngực quá 10 giây cho đến khi nhân viên y tế đến.'
      ]
    },
    choking: {
      title: 'SƠ CỨU HÓC DỊ VẬT',
      overview: 'Hóc dị vật là tình trạng đường thở bị tắc nghẽn bởi thức ăn hoặc vật lạ, có thể gây ngạt thở nhanh chóng.',
      steps: [
        'Xác định tình trạng: Nếu nạn nhân có thể ho hoặc nói, hãy khuyến khích họ ho mạnh.',
        'Thủ thuật Heimlich: Đứng sau nạn nhân, vòng tay qua eo, nắm tay lại đặt trên rốn và thực hiện động tác ấn mạnh vào trong và hướng lên trên.',
        'Lặp lại: Thực hiện 5 lần ấn bụng liên tiếp cho đến khi dị vật văng ra.',
        'Nếu nạn nhân bất tỉnh: Đưa nạn nhân nằm xuống và bắt đầu thực hiện CPR.'
      ],
      warnings: [
        'Không cố móc dị vật bằng tay nếu không nhìn thấy rõ, vì có thể làm dị vật lọt sâu hơn.',
        'Không thực hiện Heimlich cho trẻ dưới 1 tuổi (dùng kỹ thuật vỗ lưng ấn ngực).'
      ]
    },
    burns: {
      title: 'SƠ CỨU VẾT BỎNG',
      overview: 'Xử lý vết bỏng kịp thời giúp giảm đau, hạn chế tổn thương sâu và ngăn ngừa nhiễm trùng.',
      steps: [
        'Làm mát vết bỏng: Ngâm hoặc xả nước mát (không dùng nước đá) lên vết bỏng trong ít nhất 15-20 phút.',
        'Loại bỏ vật trang sức: Nhẹ nhàng tháo nhẫn, đồng hồ trước khi vùng bỏng bị sưng nề.',
        'Che phủ vết bỏng: Dùng gạc sạch hoặc màng bọc thực phẩm bao phủ nhẹ nhàng vết bỏng.',
        'Giữ ấm nạn nhân: Nếu bỏng diện rộng, hãy giữ ấm cơ thể để tránh sốc.'
      ],
      warnings: [
        'Tuyệt đối không bôi kem đánh răng, mỡ trăn hay dầu ăn lên vết bỏng.',
        'Không làm vỡ các nốt phồng rộp (bóng nước).'
      ]
    },
    bleeding: {
      title: 'CẦM MÁU VẾT THƯƠNG',
      overview: 'Cầm máu nhanh chóng là ưu tiên hàng đầu để bảo vệ tính mạng khi có vết thương hở.',
      steps: [
        'Băng ép trực tiếp: Dùng gạc hoặc vải sạch ép mạnh trực tiếp lên vết thương.',
        'Nâng cao vùng bị thương: Giữ vùng bị thương cao hơn mức tim nếu có thể.',
        'Băng bó: Sử dụng băng cuộn để giữ gạch ép cố định.',
        'Nếu máu thấm qua băng: Đừng tháo băng cũ, hãy đắp thêm lớp băng mới lên trên.'
      ],
      warnings: [
        'Không dùng ga-rô trừ khi vết thương quá nặng không thể cầm máu bằng cách ép trực tiếp.',
        'Không tháo các vật đâm xuyên sâu vào cơ thể (dao, mảnh kính).'
      ]
    },
    fractures: {
      title: 'CHẤN THƯƠNG XƯƠNG KHỚP',
      overview: 'Cố định vùng xương gãy giúp giảm đau và ngăn ngừa tổn thương thêm các mô xung quanh.',
      steps: [
        'Giữ nguyên vị trí: Không cố gắng nắn chỉnh xương về vị trí cũ.',
        'Bất động vùng thương: Dùng nẹp hoặc vật cứng để cố định khớp trên và khớp dưới vùng bị gãy.',
        'Chườm lạnh: Chườm đá qua một lớp vải để giảm sưng và đau.',
        'Kê cao chi: Nếu là chi, hãy kê cao hơn mức tim để giảm phù nề.'
      ],
      warnings: [
        'Không di chuyển nạn nhân nếu nghi ngờ chấn thương cột sống.',
        'Không cho nạn nhân ăn hoặc uống trước khi gặp bác sĩ.'
      ]
    },
    heatstroke: {
      title: 'XỬ LÝ SAY NẮNG & ĐỘT QUỴ',
      overview: 'Say nắng là tình trạng cấp cứu nghiêm trọng khi nhiệt độ cơ thể tăng quá cao (trên 40°C).',
      steps: [
        'Di chuyển vào chỗ mát: Đưa nạn nhân vào bóng râm hoặc phòng máy lạnh.',
        'Làm mát nhanh: Cởi bỏ bớt quần áo, dùng khăn ướt lau khắp cơ thể hoặc phun nước mát.',
        'Bổ sung nước: Cho nạn nhân uống nước mát từng ngụm nhỏ nếu họ còn tỉnh táo.',
        'Kiểm tra thân nhiệt: Tiếp tục làm mát cho đến khi thân nhiệt hạ xuống mức an toàn.'
      ],
      warnings: [
        'Không cho nạn nhân uống thuốc hạ sốt (như Paracetamol) vì không có tác dụng trong trường hợp này.',
        'Không dội trực tiếp nước đá lạnh lên người nạn nhân vì có thể gây sốc nhiệt.'
      ]
    }
  };

  const data = firstAidData[id] || firstAidData.cpr;

  return (
    <div className="first-aid-detail-page" style={{animation: 'fadeIn 0.8s ease-out', paddingBottom: '100px', background: '#FFF'}}>
      {/* Dynamic Header */}
      <div style={{background: 'var(--primary-blue)', color: 'white', padding: '80px 0', marginBottom: '60px'}}>
        <div className="medical-container">
          <button onClick={() => navigate('/first-aid')} style={{background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', padding: '12px 24px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px', fontWeight: 800, fontSize: '0.9rem'}}>
            <ArrowLeft size={18} /> QUAY LẠI DANH MỤC
          </button>
          <h1 style={{fontSize: '3rem', fontWeight: 950, color: 'white', letterSpacing: '-0.04em'}}>{data.title}</h1>
        </div>
      </div>

      <div className="medical-container" style={{maxWidth: '1200px'}}>
        {/* I. Giới thiệu chung */}
        <div style={{marginBottom: '50px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px'}}>
            <div style={{width: '6px', height: '30px', background: 'var(--primary-blue)', borderRadius: '3px'}}></div>
            <h2 style={{fontSize: '1.6rem', fontWeight: 900, color: '#1A1A1A'}}>I. TỔNG QUAN</h2>
          </div>
          <p style={{fontSize: '1.1rem', lineHeight: 1.8, color: '#444', textAlign: 'justify'}}>
            {data.overview}
          </p>
        </div>

        {/* II. Các bước thực hiện */}
        <div style={{marginBottom: '50px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px'}}>
            <div style={{width: '6px', height: '30px', background: 'var(--primary-blue)', borderRadius: '3px'}}></div>
            <h2 style={{fontSize: '1.6rem', fontWeight: 900, color: '#1A1A1A'}}>II. CÁC BƯỚC SƠ CỨU</h2>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
            {data.steps.map((step, idx) => (
              <div key={idx} style={{display: 'flex', gap: '20px', background: '#F8F9FA', padding: '25px', borderRadius: '20px', border: '1px solid #EEE'}}>
                <div style={{width: '40px', height: '40px', background: 'var(--primary-blue)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 900, fontSize: '1.2rem'}}>
                  {idx + 1}
                </div>
                <p style={{margin: 0, fontSize: '1.05rem', fontWeight: 600, color: '#333', lineHeight: 1.6}}>
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* III. Cảnh báo */}
        <div style={{marginBottom: '60px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px'}}>
            <div style={{width: '6px', height: '30px', background: '#FF3B30', borderRadius: '3px'}}></div>
            <h2 style={{fontSize: '1.6rem', fontWeight: 900, color: '#FF3B30'}}>III. NHỮNG ĐIỀU CẦN TRÁNH</h2>
          </div>
          <div style={{background: '#FFF1F0', border: '2px dashed #FF3B30', padding: '30px', borderRadius: '24px'}}>
            <ul style={{margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px'}}>
              {data.warnings.map((warning, idx) => (
                <li key={idx} style={{color: '#D32F2F', fontWeight: 700, fontSize: '1rem'}}>
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Call to Action */}
        <div style={{background: '#F0F7FF', padding: '40px', borderRadius: '32px', textAlign: 'center', border: '1px solid #D0E1F9'}}>
          <h3 style={{color: 'var(--primary-blue)', fontSize: '1.3rem', marginBottom: '15px'}}>GẶP TÌNH HUỐNG KHẨN CẤP?</h3>
          <p style={{color: '#666', marginBottom: '30px'}}>Hãy bình tĩnh và kích hoạt tín hiệu SOS ngay để được cộng đồng hỗ trợ.</p>
          <div style={{display: 'flex', justifyContent: 'center', gap: '20px'}}>
             <button onClick={() => navigate('/sos')} style={{background: '#FF3B30', color: 'white', border: 'none', padding: '15px 40px', borderRadius: '15px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px'}}>
               <AlertTriangle size={20} /> KÍCH HOẠT SOS
             </button>
             <button style={{background: 'white', color: 'var(--primary-blue)', border: '2px solid var(--primary-blue)', padding: '15px 40px', borderRadius: '15px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px'}}>
               <Phone size={20} /> GỌI CẤP CỨU 115
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
