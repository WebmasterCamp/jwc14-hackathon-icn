import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Simple rule-based chatbot for hardware selection
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, history } = await request.json();
    const userMessage = message.toLowerCase();

    // Get user's active contracts for personalized responses
    let userEquipment: any[] = [];
    if (session.user.role === 'CUSTOMER') {
      const customer = await prisma.customer.findUnique({
        where: { userId: session.user.id },
      });

      if (customer) {
        const contracts = await prisma.contract.findMany({
          where: {
            customerId: customer.id,
            status: 'ACTIVE',
          },
          include: {
            items: {
              include: {
                equipment: {
                  include: {
                    category: true,
                  },
                },
              },
            },
          },
        });

        userEquipment = contracts.flatMap((c) =>
          c.items.map((i) => i.equipment)
        );
      }
    }

    let response = '';

    // Greeting patterns
    if (
      /^(สวัสดี|หวัดดี|hello|hi|hey)/.test(userMessage) ||
      userMessage.length < 5
    ) {
      response = `สวัสดีครับ! ยินดีต้อนรับสู่ Spark Go 😊\n\nผมสามารถช่วยคุณได้หลายเรื่องเลย:\n\n🔧 แนะนำอุปกรณ์ที่เหมาะกับโปรเจกต์\n📦 ตรวจสอบอุปกรณ์ที่คุณเช่าอยู่\n💡 แนะนำการใช้งานระบบ\n🛠️ แจ้งปัญหาหรือซ่อมบำรุง\n\nลองถามผมได้เลยครับ เช่น "อยากทำโปรเจกต์ IoT" หรือ "มีอุปกรณ์อะไรบ้าง"`;
    }
    // Arduino/Microcontroller queries
    else if (
      /arduino|ไมโครคอนโทรลเลอร์|บอร์ด|microcontroller/.test(userMessage)
    ) {
      response = `สำหรับโปรเจกต์ Arduino เรามีอุปกรณ์แนะนำดังนี้:\n\n🎯 Arduino Uno R3 - เหมาะสำหรับผู้เริ่มต้น\n🎯 Arduino Mega - สำหรับโปรเจกต์ขนาดใหญ่\n🎯 ESP32 - มี WiFi/Bluetooth ในตัว\n🎯 Raspberry Pi - สำหรับโปรเจกต์ที่ซับซ้อน\n\nคุณสนใจทำโปรเจกต์แบบไหนครับ? ผมจะแนะนำเซ็นเซอร์และอุปกรณ์เสริมให้`;
    }
    // IoT queries
    else if (/iot|internet of things|อินเทอร์เน็ต/.test(userMessage)) {
      response = `โปรเจกต์ IoT น่าสนใจมากเลยครับ! 🌐\n\nอุปกรณ์ที่แนะนำ:\n• ESP32/ESP8266 - มี WiFi ในตัว\n• Raspberry Pi - ทำ IoT Gateway ได้\n• เซ็นเซอร์ต่างๆ (อุณหภูมิ, ความชื้น, แสง)\n• Relay Module - ควบคุมอุปกรณ์ไฟฟ้า\n\nคุณอยากทำโปรเจกต์ IoT แบบไหนครับ? (เช่น Smart Home, เกษตรอัจฉริยะ)`;
    }
    // Robot queries
    else if (/หุ่นยนต์|robot|รถ|car/.test(userMessage)) {
      response = `โปรเจกต์หุ่นยนต์สนุกมากครับ! 🤖\n\nอุปกรณ์ที่ต้องใช้:\n• Arduino/ESP32 - สมองของหุ่นยนต์\n• Motor Driver (L298N) - ขับมอเตอร์\n• DC Motor หรือ Servo Motor\n• เซ็นเซอร์ (Ultrasonic, IR)\n• แบตเตอรี่และชุดตัวถัง\n\nต้องการทำหุ่นยนต์แบบไหนครับ? (เลี้ยงเส้น, หลบสิ่งกีดขวาง, หุ่นยนต์แขน)`;
    }
    // 3D Printer queries
    else if (/3d|printer|พิมพ์|เครื่องพิมพ์/.test(userMessage)) {
      response = `เครื่องพิมพ์ 3D เหมาะสำหรับทำชิ้นงานต้นแบบครับ! 🖨️\n\nเรามี:\n• Creality Ender 3 - เหมาะสำหรับผู้เริ่มต้น\n• Prusa i3 - คุณภาพสูง\n• Resin Printer - รายละเอียดสูงมาก\n\nพร้อมวัสดุ Filament (PLA, ABS) และอุปกรณ์เสริม\n\nต้องการพิมพ์ชิ้นงานแบบไหนครับ?`;
    }
    // Sensor queries
    else if (/เซ็นเซอร์|sensor|วัด/.test(userMessage)) {
      response = `เรามีเซ็นเซอร์หลากหลายครับ! 📊\n\n🌡️ อุณหภูมิ/ความชื้น (DHT11, DHT22)\n💡 แสง (LDR, BH1750)\n📏 ระยะทาง (Ultrasonic HC-SR04)\n🔥 ไฟ/ควัน (MQ-2, MQ-135)\n💧 ความชื้นดิน\n🎵 เสียง\n\nคุณต้องการวัดอะไรครับ? ผมจะแนะนำเซ็นเซอร์ที่เหมาะสม`;
    }
    // Drone queries
    else if (/โดรน|drone|บิน/.test(userMessage)) {
      response = `โดรนเป็นโปรเจกต์ที่ท้าทายครับ! 🚁\n\nอุปกรณ์ที่ต้องใช้:\n• Flight Controller (Pixhawk, CC3D)\n• Brushless Motor + ESC\n• Propeller\n• แบตเตอรี่ LiPo\n• Remote Control\n• GPS Module (ถ้าต้องการ)\n\nแนะนำให้เริ่มจากโดรนสำเร็จรูปก่อนครับ จะปลอดภัยกว่า`;
    }
    // Check user's equipment
    else if (
      /เช่า|มี|ของฉัน|my|equipment|อุปกรณ์ของ/.test(userMessage)
    ) {
      if (userEquipment.length > 0) {
        const equipmentList = userEquipment
          .map((eq) => `• ${eq.name} (${eq.category.nameTh})`)
          .join('\n');
        response = `คุณกำลังเช่าอุปกรณ์เหล่านี้อยู่:\n\n${equipmentList}\n\nต้องการความช่วยเหลือเกี่ยวกับอุปกรณ์เหล่านี้ไหมครับ?`;
      } else {
        response = `ตอนนี้คุณยังไม่ได้เช่าอุปกรณ์ครับ\n\nลองดูอุปกรณ์ที่เรามีได้ที่หน้า "อุปกรณ์ทั้งหมด" หรือบอกผมว่าคุณอยากทำโปรเจกต์แบบไหน ผมจะแนะนำให้ครับ!`;
      }
    }
    // Maintenance/repair queries
    else if (/ซ่อม|แจ้ง|เสีย|ชำรุด|repair|broken/.test(userMessage)) {
      response = `หากอุปกรณ์มีปัญหา คุณสามารถแจ้งซ่อมได้ที่:\n\n📋 เมนู "คำขอซ่อมบำรุง"\n\nกรุณาระบุ:\n• อุปกรณ์ที่มีปัญหา\n• อาการที่พบ\n• รูปภาพ (ถ้ามี)\n\nทีมช่างจะติดต่อกลับภายใน 24 ชั่วโมงครับ`;
    }
    // Price queries
    else if (/ราคา|เท่าไหร่|price|cost|ค่า/.test(userMessage)) {
      response = `ราคาเช่าอุปกรณ์ขึ้นอยู่กับประเภทและระยะเวลาครับ 💰\n\nโดยทั่วไป:\n• Arduino/ESP32: 50-200 บาท/เดือน\n• Raspberry Pi: 300-800 บาท/เดือน\n• เซ็นเซอร์: 20-100 บาท/เดือน\n• ชุดหุ่นยนต์: 500-2,000 บาท/เดือน\n\nดูราคาเต็มได้ที่หน้า "อุปกรณ์ทั้งหมด" หรือบอกผมว่าสนใจอุปกรณ์ไหน ผมจะหาราคาให้ครับ`;
    }
    // How to use system
    else if (/ใช้งาน|วิธี|how to|tutorial/.test(userMessage)) {
      response = `วิธีใช้งานระบบ Spark Go:\n\n1️⃣ เลือกอุปกรณ์ที่ต้องการ\n2️⃣ กดปุ่ม "เช่าเลย"\n3️⃣ กรอกข้อมูลและเลือกระยะเวลา\n4️⃣ รอการอนุมัติจากผู้ให้บริการ\n5️⃣ รับอุปกรณ์และเริ่มโปรเจกต์!\n\nมีคำถามเพิ่มเติมไหมครับ?`;
    }
    // Default response
    else {
      response = `ขอโทษครับ ผมไม่แน่ใจว่าคุณต้องการอะไร 🤔\n\nลองถามผมเรื่องเหล่านี้ได้เลย:\n• "อยากทำโปรเจกต์ IoT"\n• "มีอุปกรณ์อะไรบ้าง"\n• "แนะนำเซ็นเซอร์หน่อย"\n• "ราคาเท่าไหร่"\n• "วิธีใช้งานระบบ"\n\nหรือพิมพ์คำถามของคุณใหม่อีกครั้งครับ`;
    }

    return NextResponse.json({ message: response });
  } catch (error) {
    console.error('Chatbot error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
