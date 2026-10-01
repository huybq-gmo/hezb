# Hezb - Static Menu và Business Content

File này là content contract cho `messages/vi.json` và `messages/en.json`. Nội dung dưới đây là bản draft lấy từ mockup; trước go-live cần thay email, điện thoại, địa chỉ và các claim chưa được xác nhận bằng thông tin thật.

## Menu

| Key | VI | EN | Route |
|---|---|---|---|
| `home` | Trang chủ | Home | `/[locale]` |
| `about` | Giới thiệu | About | `/[locale]/about` |
| `projects` | Dự án | Projects | `/[locale]/projects` |
| `members` | Thành viên | Members | `/[locale]/members` |
| `careers` | Sự nghiệp | Careers | `/[locale]/careers` |
| `contact` | Liên hệ | Contact | `/[locale]/contact` |

Admin không sửa menu hoặc copy tĩnh. Khi đổi nội dung, cập nhật message file, review bản dịch và deploy như một thay đổi code.

## Home

### VI

- Eyebrow: `Công ty AI & phần mềm`
- Hero: `Kiến tạo` + highlight `điều tiếp theo` + `cùng AI & phần mềm`
- Hero subtitle: `Mọi thứ bắt đầu từ một câu hỏi: “Tiếp theo sẽ là gì?” Chúng tôi không chờ tương lai xuất hiện, chúng tôi tự tay xây dựng nó.`
- Primary CTA: `Liên hệ với Hezb`
- Secondary CTA: `Xem dự án`
- Story title: `Câu chuyện của Hezb`
- Story body: `Hezb là công ty công nghệ tập trung vào AI và phần mềm, đồng hành cùng doanh nghiệp để biến những vấn đề thực tế thành sản phẩm có thể vận hành.`
- Mission title: `Sứ mệnh`
- Values title: `Giá trị Hezb mang lại`
- Featured projects title: `Dự án tiêu biểu`
- Featured members title: `Đội ngũ Hezb`
- CTA title: `Tò mò điều gì sẽ đến tiếp theo?`
- CTA body: `Hãy cùng xây dựng với chúng tôi.`

### EN

- Eyebrow: `AI & Software Company`
- Hero: `Build` + highlight `what’s next` + `with AI & software`
- Hero subtitle: `It all started with one question: “What’s next?” We did not wait for the future to show up. We chose to build it ourselves.`
- Primary CTA: `Contact Hezb`
- Secondary CTA: `View projects`
- Story title: `The Hezb story`
- Story body: `Hezb is a technology company focused on AI and software, working with businesses to turn real problems into products that can run in the real world.`
- Mission title: `Our mission`
- Values title: `The value we bring`
- Featured projects title: `Featured projects`
- Featured members title: `The Hezb team`
- CTA title: `Curious about what comes next?`
- CTA body: `Come build it with us.`

Mission items and value items can reuse the four pairs from the mockup, stored as arrays in each locale message file. They are static and are not edited through admin.

## About

### VI

- Title: `Về Hezb`
- Intro: `Hezb xây dựng các sản phẩm AI và phần mềm giúp doanh nghiệp làm việc hiệu quả hơn, đơn giản hơn và sẵn sàng cho bước tiếp theo.`
- Sections: `Chúng tôi giải quyết vấn đề thật`, `Công nghệ phải dễ dùng`, `Đồng hành từ ý tưởng đến vận hành`
- CTA: `Kể cho chúng tôi nghe về bài toán của bạn`

### EN

- Title: `About Hezb`
- Intro: `Hezb builds AI and software products that help businesses work more effectively, more simply and with confidence about what comes next.`
- Sections: `We solve real problems`, `Technology should feel usable`, `From idea to operation`
- CTA: `Tell us about your challenge`

## Careers

### VI

- Title: `Sự nghiệp tại Hezb`
- Body: `Chúng tôi tìm những người thích đặt câu hỏi, xây dựng điều mới và chịu trách nhiệm đến cùng với sản phẩm mình tạo ra.`
- Status: `Hiện chưa có vị trí tuyển dụng công khai. Nếu bạn nghĩ mình phù hợp, hãy gửi lời chào và hồ sơ cho Hezb.`
- CTA: `Liên hệ với Hezb`

### EN

- Title: `Careers at Hezb`
- Body: `We look for people who ask good questions, build new things and stay accountable for the products they help create.`
- Status: `There are no public openings right now. If you think you could be a fit, send Hezb an introduction and your profile.`
- CTA: `Contact Hezb`

## Contact

Contact page copy is static, but submissions are dynamic rows in `contact_messages`:

- VI title: `Liên hệ`
- VI intro: `Kể cho chúng tôi nghe về dự án của bạn. Hezb sẽ phản hồi trong một ngày làm việc.`
- EN title: `Contact`
- EN intro: `Tell us about your project. Hezb will reply within one business day.`
- Topics: AI integration, custom software, process automation, other.

Email, phone and address are required message keys but intentionally left for the owner to fill with real business information before Phase 9. Do not use `hello@hezb.example`, `+84 000 000 000` or another placeholder in production.

## Footer

- VI: `© 2026 Hezb - Build what’s next.`
- EN: `© 2026 Hezb - Build what’s next.`
- Hashtags: `#Hezb #BuildWhatsNext #AI`
