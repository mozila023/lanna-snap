/* ===== Lanna Snap — card set v1 (facts: RESEARCH.md) =====
   Ability hooks (engine API E):
   reveal(E,c)            on reveal
   aura(E,src,tgt) -> n   ongoing power bonus src gives tgt (both on board)
   endTurn(E,c)           end of every turn while on board
*/
const t=(th,en)=>({th,en});
const PROV={
  cm:{ab:t('ชม.','CM'),name:t('เชียงใหม่','Chiang Mai'),col:'#7b4bb7',ink:'#fff'},
  cr:{ab:t('ชร.','CR'),name:t('เชียงราย','Chiang Rai'),col:'#2f8fd6',ink:'#fff'},
  lp:{ab:t('ลป.','LP'),name:t('ลำปาง','Lampang'),col:'#d8423a',ink:'#fff'},
  lu:{ab:t('ลพ.','LU'),name:t('ลำพูน','Lamphun'),col:'#d9a520',ink:'#2a1c06'},
  ms:{ab:t('มส.','MS'),name:t('แม่ฮ่องสอน','Mae Hong Son'),col:'#3f9a7a',ink:'#fff'},
  nn:{ab:t('นน.','NN'),name:t('น่าน','Nan'),col:'#ef7d22',ink:'#fff'},
  pr:{ab:t('พร.','PR'),name:t('แพร่','Phrae'),col:'#2c3f86',ink:'#fff'},
  py:{ab:t('พย.','PY'),name:t('พะเยา','Phayao'),col:'#1f5d8c',ink:'#fff'},
  ut:{ab:t('อต.','UT'),name:t('อุตรดิตถ์','Uttaradit'),col:'#76b33c',ink:'#16300a'},
  ln:{ab:t('ลน.','LN'),name:t('ล้านนา (ทั่วไป)','Lanna (neutral)'),col:'#8d8576',ink:'#fff'},
};
const TYPES={job:t('ฮีโร่อาชีพ','Local hero'),legend:t('ตำนาน','Legend'),animal:t('สัตว์','Animal'),item:t('ของดี','Treasure'),temple:t('วัด','Temple'),food:t('ของกิน','Food')};
const has=(c,p)=>c.def.prov.includes(p);
const C=[];
const card=(o)=>{ C.push(o); return o; };

/* ---------- Chiang Mai ---------- */
card({id:'bosang',prov:['cm'],type:'job',cost:2,power:3,name:t('ช่างร่มบ่อสร้าง','Bo Sang Umbrella Maker'),
  text:t('ลงปุ๊บ: ให้การ์ดเราอีก 1 ใบในสนามนี้ได้ "ป้องกัน"','On Reveal: Shield another of your cards here.'),
  reveal:(E,c)=>E.shield(E.pickAlly(c,{here:true,other:true})),
  lore:t('บ้านบ่อสร้าง อ.สันกำแพง เป็นหมู่บ้านชาวไทลื้อ ขึ้นชื่อเรื่องร่มทำมือวาดลายดอกไม้ มีงานเทศกาลร่มช่วงสัปดาห์ที่สามของเดือนมกราคม','Bo Sang is a Tai Lue village famous for hand-painted umbrellas, with a festival in the third week of January.')});
card({id:'wualai',prov:['cm'],type:'job',cost:3,power:4,name:t('ช่างเงินวัวลาย','Wua Lai Silversmith'),
  text:t('ต่อเนื่อง: การ์ดของดีของเราในสนามนี้ +2','Ongoing: Your Treasures here have +2.'),
  aura:(E,s,x)=>x.owner===s.owner&&x.loc===s.loc&&x.def.type==='item'?2:0,
  lore:t('ย่านวัวลายในเมืองเชียงใหม่ ขึ้นชื่อเรื่องเครื่องเงินดุนลายฝีมือช่างท้องถิ่น','The Wua Lai quarter of Chiang Mai is known for embossed silverwork.')});
card({id:'tilokaraj',prov:['cm'],type:'legend',cost:5,power:7,name:t('พระเจ้าติโลกราช','King Tilokaraj'),
  text:t('ลงปุ๊บ: การ์ดเราอื่นในสนามนี้ +1 (ถ้าช่องวัดเป็นวัด ชม. +2)','On Reveal: Your other cards here get +1 (+2 if a Chiang Mai temple is in the slot).'),
  reveal:(E,c)=>{ const n=E.templeProv()==='cm'?2:1; for(const a of E.allies(c,{here:true,other:true})) E.buff(a,n); },
  lore:t('กษัตริย์ล้านนา ครองราชย์ พ.ศ. 1984–2030 (ค.ศ. 1441–1487) ทรงสร้างวัดเจ็ดยอด และขยายอาณาจักรไปถึงน่านและแพร่','King of Lan Na 1441–1487. He built Wat Chet Yot and brought Nan and Phrae under Lan Na.')});
card({id:'inthawichayanon',prov:['cm'],type:'legend',cost:4,power:4,name:t('เจ้าอินทวิชยานนท์','Prince Inthawichayanon'),
  text:t('ต่อเนื่อง: การ์ดสัตว์ของเราทุกสนาม +1','Ongoing: Your Animals everywhere have +1.'),
  aura:(E,s,x)=>x.owner===s.owner&&x.def.type==='animal'?1:0,
  lore:t('เจ้าหลวงเชียงใหม่ผู้ห่วงใยป่าภาคเหนือ ดอยหลวงถูกเปลี่ยนชื่อเป็น "ดอยอินทนนท์" เพื่อเป็นเกียรติแก่ท่าน','A Grand Prince of Chiang Mai who cared for the northern forests. Doi Luang was renamed Doi Inthanon in his honour.')});
card({id:'whiteelephant',prov:['cm','cr'],type:'animal',cost:3,power:3,name:t('ช้างเผือก','White Elephant'),
  text:t('ลงปุ๊บ: การ์ด ชม. และ ชร. ในมือเรา +1','On Reveal: Chiang Mai and Chiang Rai cards in your hand get +1.'),
  reveal:(E,c)=>{ for(const h of E.hand(c.owner)) if(has(h,'cm')||has(h,'cr')) E.buff(h,1); },
  lore:t('ช้างเผือกปรากฏบนตราจังหวัดทั้งเชียงใหม่และเชียงราย ตำนานเล่าว่าพญามังรายสร้างเมืองเชียงรายเพราะช้างของท่านถูกใจชัยภูมินั้น','White elephants appear on both the Chiang Mai and Chiang Rai seals. Legend says Mangrai founded Chiang Rai because his elephant liked the site.')});
card({id:'teenjok',prov:['cm'],type:'item',cost:1,power:0,name:t('ผ้าซิ่นตีนจก','Teen Jok Skirt'),
  text:t('ลงปุ๊บ: การ์ดเราอีก 1 ใบในสนามนี้ +2 (ถ้าเป็น ชม. +3) แล้วการ์ดนี้หายไป','On Reveal: Another card of yours here gets +2 (+3 if Chiang Mai). Then this card vanishes.'),
  reveal:(E,c)=>{ const a=E.pickAlly(c,{here:true,other:true}); if(a) E.buff(a,has(a,'cm')?3:2); E.remove(c); },
  lore:t('ผ้าซิ่นที่มีเชิงผ้าทอลวดลาย "จก" ด้วยมือ เป็นงานผ้าล้านนาที่ทอกันมาหลายชั่วอายุคน','A tube skirt with a hand-woven "jok" hem, a Lanna textile tradition handed down for generations.')});
card({id:'doisuthep',prov:['cm'],type:'temple',cost:4,power:0,name:t('วัดพระธาตุดอยสุเทพ','Wat Phra That Doi Suthep'),
  text:t('วัด: การ์ด ชม. ทุกใบ (ทั้งสองฝ่าย) +2','Temple: All Chiang Mai cards (both sides) +2.'),temple:'cm',
  lore:t('วัดคู่เมืองเชียงใหม่บนดอยสุเทพ ตำนานเล่าว่าช้างเผือกอัญเชิญพระบรมสารีริกธาตุขึ้นไปจนถึงที่ตั้งวัด','Chiang Mai\'s great hilltop temple. Legend says a white elephant carried a holy relic up the mountain to this spot.')});
/* ---------- dual legends ---------- */
card({id:'mangrai',prov:['cr','cm'],type:'legend',cost:6,power:9,name:t('พญามังราย','King Mangrai'),
  text:t('ต่อเนื่อง: การ์ด ชร. และ ชม. อื่นของเราในสนามนี้ +1','Ongoing: Your other Chiang Rai and Chiang Mai cards here have +1.'),
  aura:(E,s,x)=>x!==s&&x.owner===s.owner&&x.loc===s.loc&&(has(x,'cr')||has(x,'cm'))?1:0,
  lore:t('ปฐมกษัตริย์ล้านนา สร้างเมืองเชียงราย พ.ศ. 1805 (ค.ศ. 1262) และเริ่มสร้างเมืองเชียงใหม่ พ.ศ. 1839 (ค.ศ. 1296) ทำสัญญาเป็นมิตรกับพ่อขุนงำเมืองและพ่อขุนรามคำแหง','First king of Lan Na. Founded Chiang Rai in 1262 and began Chiang Mai in 1296. Allied with Ngam Mueang and Ramkhamhaeng.')});
card({id:'kawila',prov:['cm','lp'],type:'legend',cost:4,power:5,name:t('พระเจ้ากาวิละ','Kawila of Chiang Mai'),
  text:t('ลงปุ๊บ: ย้ายการ์ด ชม. หรือ ลป. ของเรา 1 ใบจากสนามอื่นมาที่นี่','On Reveal: Move one of your Chiang Mai or Lampang cards from another location to here.'),
  reveal:(E,c)=>{ const a=E.pickAlly(c,{elsewhere:true,pred:x=>has(x,'cm')||has(x,'lp')}); if(a) E.move(a,c.loc); },
  lore:t('เกิดที่ลำปาง พ.ศ. 2285 เป็นหลานของหนานทิพย์ช้าง ครองเชียงใหม่ และพาผู้คนกลับเข้าฟื้นฟูเมืองเชียงใหม่ในปี พ.ศ. 2340 (ค.ศ. 1797)','Born in Lampang in 1742, grandson of Thipchang. He ruled Chiang Mai and led its people back to restore the city in 1797.')});
/* ---------- Chiang Rai ---------- */
card({id:'teafarmer',prov:['cr'],type:'job',cost:1,power:1,name:t('ชาวไร่ชาบนดอย','Hill Tea Farmer'),
  text:t('ลงปุ๊บ: การ์ดใบถัดไปที่เราลงในสนามนี้ +2','On Reveal: The next card you play here gets +2.'),
  reveal:(E,c)=>E.nextHere(c,2),
  lore:t('ชาเป็นพืชสำคัญของเชียงราย อยู่ในคำขวัญเดิมของจังหวัด','Tea is a key Chiang Rai crop and appeared in the old provincial slogan.')});
card({id:'coffeefarmer',prov:['cr'],type:'job',cost:2,power:2,name:t('ชาวไร่กาแฟ','Coffee Grower'),
  text:t('ลงปุ๊บ: จั่วการ์ด 1 ใบ','On Reveal: Draw a card.'),reveal:(E,c)=>E.draw(c.owner,1),
  lore:t('เชียงรายปลูกกาแฟ สับปะรด และพืชอื่นทดแทนการปลูกฝิ่นในอดีต','Coffee and other crops replaced opium growing in Chiang Rai.')});
card({id:'catfish',prov:['cr','py'],type:'animal',cost:5,power:8,name:t('ปลาบึก','Mekong Giant Catfish'),
  text:t('ปลาน้ำจืดยักษ์ ไม่มีความสามารถ แต่ตัวใหญ่มาก','A giant. No ability, just huge.'),
  lore:t('สัตว์น้ำประจำจังหวัดทั้งเชียงรายและพะเยา สถานีประมงพะเยาเป็นแห่งแรกของโลกที่เพาะพันธุ์ปลาบึกได้สำเร็จ','Provincial aquatic animal of both Chiang Rai and Phayao. Phayao\'s fishery station was the first to breed it successfully.')});
card({id:'nanglae',prov:['cr'],type:'item',cost:1,power:0,name:t('สับปะรดนางแล','Nang Lae Pineapple'),
  text:t('ลงปุ๊บ: การ์ดศัตรู 1 ใบในสนามนี้ -2 แล้วการ์ดนี้หายไป','On Reveal: An enemy card here gets -2. Then this card vanishes.'),
  reveal:(E,c)=>{ const e=E.pickEnemy(c,{here:true}); if(e) E.buff(e,-2); E.remove(c); },
  lore:t('สับปะรดนางแลของเชียงรายขึ้นชื่อจนอยู่ในคำขวัญเดิมของจังหวัด','Nang Lae pineapples were famous enough to be in Chiang Rai\'s old slogan.')});
card({id:'phrakaewcr',prov:['cr'],type:'temple',cost:4,power:0,name:t('วัดพระแก้ว เชียงราย','Wat Phra Kaew, Chiang Rai'),
  text:t('วัด: การ์ด ชร. ทุกใบ (ทั้งสองฝ่าย) +2','Temple: All Chiang Rai cards (both sides) +2.'),temple:'cr',
  lore:t('พ.ศ. 1977 (ค.ศ. 1434) ฟ้าผ่าเจดีย์วัดนี้ พบพระพุทธรูปปูนปั้น เมื่อปูนกะเทาะจึงเห็นเนื้อในเป็นหินสีเขียว คือพระแก้วมรกต','In 1434 lightning split this temple\'s chedi, revealing a stucco Buddha. When the stucco flaked, the green Emerald Buddha appeared.')});
/* ---------- Lampang ---------- */
card({id:'carriage',prov:['lp'],type:'job',cost:2,power:2,name:t('คนขับรถม้า','Carriage Driver'),
  text:t('ลงปุ๊บ: ย้ายการ์ดเรา 1 ใบจากสนามนี้ไปสนามอื่นได้','On Reveal: You may move another card of yours from here to another location.'),
  reveal:(E,c)=>{ const a=E.pickAlly(c,{here:true,other:true}); if(a) E.moveAnywhere(a); },
  lore:t('ลำปางเป็นจังหวัดเดียวที่ยังใช้รถม้า ได้ชื่อว่า "เมืองรถม้า"','Lampang is the only province still using horse carriages.')});
card({id:'bowlpainter',prov:['lp'],type:'job',cost:3,power:4,name:t('ช่างเพ้นต์ชามตราไก่','Rooster-Bowl Painter'),
  text:t('ลงปุ๊บ: การ์ด ลป. อื่นของเราในสนามนี้ +1','On Reveal: Your other Lampang cards here get +1.'),
  reveal:(E,c)=>{ for(const a of E.allies(c,{here:true,other:true})) if(has(a,'lp')) E.buff(a,1); },
  lore:t('ชามตราไก่วาดมือ ลายไก่ ดอกโบตั๋น และต้นกล้วย ใช้ดินขาวจาก อ.แจ้ห่ม','Hand-painted rooster bowls with peonies and banana trees, made from Chae Hom kaolin.')});
card({id:'thipchang',prov:['lp'],type:'legend',cost:5,power:6,name:t('หนานทิพย์ช้าง','Thipchang'),
  text:t('ลงปุ๊บ: การ์ดศัตรูที่พลังสูงสุดในสนามนี้ -4','On Reveal: The strongest enemy card here gets -4.'),
  reveal:(E,c)=>{ const e=E.strongestEnemy(c); if(e) E.buff(e,-4); },
  lore:t('พ.ศ. 2275 ลอบเข้าวัดพระธาตุลำปางหลวงที่ทัพพม่ายึดไว้ แล้วยิงแม่ทัพจนทัพแตก ต่อมาได้เป็นเจ้าเมืองลำปาง','In 1732 he slipped into Lampang Luang, then held by a Burmese army, and shot their commander. He became ruler of Lampang.')});
card({id:'anantayot',prov:['lp','lu'],type:'legend',cost:3,power:3,name:t('เจ้าอนันตยศ','Prince Anantayot'),
  text:t('ต่อเนื่อง: +3 ถ้าพระนางจามเทวีของเราอยู่ในสนามเดียวกัน','Ongoing: +3 if your Queen Chamadevi is at this location.'),
  aura:(E,s,x)=>x===s&&E.allies(s,{here:true,other:true}).some(a=>a.def.id==='chamadevi')?3:0,
  lore:t('โอรสของพระนางจามเทวี ตำนานท้องถิ่นเล่าว่าท่านไปสร้างเขลางค์นคร เมืองเก่าของลำปาง','A son of Queen Chamadevi. Local legend says he founded Khelang Nakhon, old Lampang.')});
card({id:'rooster',prov:['lp'],type:'animal',cost:1,power:1,name:t('ไก่ขาว','White Rooster'),
  text:t('ลงปุ๊บ: ปลุกการ์ดเราในสนามนี้ ลบสถานะผิดปกติทั้งหมด และ +1','On Reveal: Wake your cards here: clear their bad statuses and give them +1.'),
  reveal:(E,c)=>{ for(const a of E.allies(c,{here:true,other:true})){ E.cleanse(a); E.buff(a,1); } },
  lore:t('ตำนานเล่าว่าพระอินทร์แปลงเป็นไก่ขาวปลุกชาวบ้านให้ตื่นมาทำบุญ ไก่ขาวจึงเป็นตราประจำจังหวัดลำปาง','Legend says Indra became a white rooster to wake the people for alms, so the rooster is Lampang\'s seal.')});
card({id:'elephantlp',prov:['lp'],type:'animal',cost:4,power:5,name:t('ช้างไทย','Thai Elephant'),
  text:t('ลงปุ๊บ: การ์ดศัตรู 1 ใบในสนามนี้ "มึนงง"','On Reveal: Stun an enemy card here.'),
  reveal:(E,c)=>E.status(E.strongestEnemy(c),'stun'),
  lore:t('ลำปางมีศูนย์อนุรักษ์ช้างไทย ซึ่งเริ่มจากโรงเรียนฝึกลูกช้างทำไม้เมื่อปี พ.ศ. 2512','Lampang is home to the Thai Elephant Conservation Center, which began as a logging-elephant school in 1969.')});
card({id:'khaotaen',prov:['lp'],type:'item',cost:1,power:0,name:t('ข้าวแต๋น','Khao Taen'),
  text:t('ลงปุ๊บ: การ์ดเรา 1 ใบในสนามนี้ +2 (ถ้าเป็น ลป. +3) แล้วการ์ดนี้หายไป','On Reveal: A card of yours here gets +2 (+3 if Lampang). Then this card vanishes.'),
  reveal:(E,c)=>{ const a=E.pickAlly(c,{here:true,other:true}); if(a) E.buff(a,has(a,'lp')?3:2); E.remove(c); },
  lore:t('ข้าวเหนียวผสมน้ำแตงโม ตากแดด ทอด แล้วราดน้ำอ้อย ของฝากขึ้นชื่อของลำปาง','Sticky rice with watermelon juice, sun-dried, fried and drizzled with cane sugar.')});
card({id:'lampangluang',prov:['lp'],type:'temple',cost:4,power:0,name:t('วัดพระธาตุลำปางหลวง','Wat Phra That Lampang Luang'),
  text:t('วัด: การ์ด ลป. ทุกใบ (ทั้งสองฝ่าย) +2','Temple: All Lampang cards (both sides) +2.'),temple:'lp',
  lore:t('วิหารไม้ล้านนาที่สมบูรณ์ที่สุดแห่งหนึ่ง มีเงาพระธาตุกลับหัวที่เกิดจากหลักการกล้องรูเข็ม','One of the finest Lanna wooden temples, famous for its upside-down chedi image.')});
/* ---------- Lamphun ---------- */
card({id:'longan',prov:['lu'],type:'job',cost:1,power:1,name:t('ชาวสวนลำไย','Longan Grower'),
  text:t('ต่อเนื่อง: การ์ด ลพ. อื่นของเราในสนามนี้ +1','Ongoing: Your other Lamphun cards here have +1.'),
  aura:(E,s,x)=>x!==s&&x.owner===s.owner&&x.loc===s.loc&&has(x,'lu')?1:0,
  lore:t('ลำพูนขึ้นชื่อเรื่องสวนลำไย','Lamphun is famous for its longan orchards.')});
card({id:'silkweaver',prov:['lu'],type:'job',cost:3,power:3,name:t('ช่างทอผ้าไหมยกดอก','Silk Brocade Weaver'),
  text:t('ลงปุ๊บ: ให้การ์ดเราทุกใบในสนามนี้ "ป้องกัน"','On Reveal: Shield all your cards here.'),
  reveal:(E,c)=>{ for(const a of E.allies(c,{here:true})) E.shield(a); },
  lore:t('ผ้าไหมยกดอกเป็นงานทอขึ้นชื่อของลำพูน','Brocade silk is a celebrated Lamphun weave.')});
card({id:'chamadevi',prov:['lu'],type:'legend',cost:6,power:9,name:t('พระนางจามเทวี','Queen Chamadevi'),
  text:t('ต่อเนื่อง: การ์ด ลพ. อื่นของเราทุกสนาม +1','Ongoing: Your other Lamphun cards everywhere have +1.'),
  aura:(E,s,x)=>x!==s&&x.owner===s.owner&&has(x,'lu')?1:0,
  lore:t('ตำนานจามเทวีวงศ์เล่าว่าฤๅษีสุเทวะเชิญพระนางจากละโว้มาครองหริภุญชัย ราว พ.ศ. 1202 (ค.ศ. 659) มีโอรสคือเจ้ามหันตยศและเจ้าอนันตยศ','The Camadevivamsa says the hermit Sudeva invited her from Lavo to rule Haripunchai around 659. Her sons were Mahantayot and Anantayot.')});
card({id:'frog',prov:['lu','ms'],type:'animal',cost:2,power:2,name:t('กบเขียดภูเขา','Hill Frog Chorus'),
  text:t('ลงปุ๊บ: การ์ดศัตรู 1 ใบในสนามนี้ "หลับ"','On Reveal: Put an enemy card here to Sleep.'),
  reveal:(E,c)=>E.status(E.pickEnemy(c,{here:true}),'sleep'),
  lore:t('สัตว์ประจำจังหวัดของลำพูนคืออึ่ง ส่วนแม่ฮ่องสอนคือกบภูเขา เสียงร้องตอนค่ำกล่อมจนหลับ','Lamphun\'s provincial animal is a frog, and Mae Hong Son\'s is the hill frog. Their evening chorus is a lullaby.')});
card({id:'lamyainoodle',prov:['lu'],type:'item',cost:2,power:0,name:t('ก๋วยเตี๋ยวลำไย','Longan Noodle Soup'),
  text:t('ลงปุ๊บ: การ์ดเราทุกใบในสนามนี้ +1 แล้วการ์ดนี้หายไป','On Reveal: Your cards here get +1. Then this card vanishes.'),
  reveal:(E,c)=>{ for(const a of E.allies(c,{here:true,other:true})) E.buff(a,1); E.remove(c); },
  lore:t('ก๋วยเตี๋ยวหมูตุ๋นใส่ลำไยอบแห้ง ว่ากันว่ามีต้นกำเนิดที่ลำพูน','Stewed pork noodles with dried longan, said to come from Lamphun.')});
card({id:'hariphunchai',prov:['lu'],type:'temple',cost:4,power:0,name:t('วัดพระธาตุหริภุญชัย','Wat Phra That Hariphunchai'),
  text:t('วัด: การ์ด ลพ. ทุกใบ (ทั้งสองฝ่าย) +2','Temple: All Lamphun cards (both sides) +2.'),temple:'lu',
  lore:t('วัดหลักของเมืองตั้งแต่สมัยมอญหริภุญชัย และอยู่บนตราประจำจังหวัดลำพูน','The city\'s chief temple since Mon Haripunchai times, and the image on Lamphun\'s seal.')});
/* ---------- Mae Hong Son ---------- */
card({id:'kuptai',prov:['ms'],type:'job',cost:1,power:2,name:t('ช่างสานกุบไต','Tai Hat Weaver'),
  text:t('ลงปุ๊บ: ตัวเองได้ "ป้องกัน"','On Reveal: Shield itself.'),reveal:(E,c)=>E.shield(c),
  lore:t('กุบไต หมวกสานทรงกว้างของชาวไทใหญ่ กลุ่มคนส่วนใหญ่ในแม่ฮ่องสอน','The kup tai is the wide woven hat of the Shan (Tai Yai), the largest group in Mae Hong Son.')});
card({id:'kaeomuangma',prov:['ms'],type:'legend',cost:4,power:4,name:t('เจ้าแก้วเมืองมา','Lord Kaeo Mueang Ma'),
  text:t('ลงปุ๊บ: เพิ่มการ์ด "ช้างป่า" (1 พลังงาน 3 พลัง) เข้ามือ','On Reveal: Add a Wild Elephant (1 cost, 3 power) to your hand.'),
  reveal:(E,c)=>E.addToHand(c.owner,'wildelephant'),
  lore:t('เจ้าเมืองเชียงใหม่ส่งท่านมาคล้องช้าง ท่านรวมผู้คนไทใหญ่ตั้งหมู่บ้าน จนกลายเป็นเมืองแม่ฮ่องสอน','Sent by the Lord of Chiang Mai to capture elephants, he gathered Shan settlers into villages that became Mae Hong Son.')});
card({id:'wildelephant',prov:['ms'],type:'animal',cost:1,power:2,token:true,name:t('ช้างป่า','Wild Elephant'),
  text:t('ช้างที่คล้องได้จากป่าแม่ฮ่องสอน','An elephant captured in the Mae Hong Son forest.'),
  lore:t('แม่ฮ่องสอนเริ่มต้นจากปางฝึกช้างช่วงต้นคริสต์ศตวรรษที่ 19','Mae Hong Son began as an elephant training camp in the early 19th century.')});
card({id:'waterelephant',prov:['ms'],type:'animal',cost:3,power:4,name:t('ช้างในน้ำ','Elephant in the Water'),
  text:t('ลงปุ๊บ: การ์ดศัตรู 1 ใบในสนามนี้ "สับสน"','On Reveal: Confuse an enemy card here.'),
  reveal:(E,c)=>E.status(E.pickEnemy(c,{here:true}),'confuse'),
  lore:t('ตราจังหวัดแม่ฮ่องสอนเป็นรูปช้างยืนในน้ำ หมายถึงการฝึกช้างป่า','Mae Hong Son\'s seal shows an elephant standing in water, recalling the training of wild elephants.')});
card({id:'buatong',prov:['ms'],type:'item',cost:2,power:0,name:t('ดอกบัวตอง','Bua Tong Blossoms'),
  text:t('ลงปุ๊บ: การ์ด มส. ทั้งหมดในมือเรา +2 แล้วการ์ดนี้หายไป','On Reveal: Mae Hong Son cards in your hand get +2. Then this card vanishes.'),
  reveal:(E,c)=>{ for(const h of E.hand(c.owner)) if(has(h,'ms')) E.buff(h,2); E.remove(c); },
  lore:t('ดอกไม้ประจำจังหวัดแม่ฮ่องสอน บานเต็มทุ่งดอยแม่อูคอ อ.ขุนยวม','Mae Hong Son\'s provincial flower, blanketing Doi Mae U-Kho in Khun Yuam.')});
card({id:'doikongmu',prov:['ms'],type:'temple',cost:4,power:0,name:t('วัดพระธาตุดอยกองมู','Wat Phra That Doi Kong Mu'),
  text:t('วัด: การ์ด มส. ทุกใบ (ทั้งสองฝ่าย) +2','Temple: All Mae Hong Son cards (both sides) +2.'),temple:'ms',
  lore:t('วัดบนดอยกองมูมองเห็นเมืองแม่ฮ่องสอน "เมืองสามหมอก"','The hilltop temple overlooking Mae Hong Son, "city of three mists".')});
/* ---------- Nan ---------- */
card({id:'rower',prov:['nn'],type:'job',cost:3,power:3,name:t('ฝีพายเรือแข่ง','Boat-Race Rower'),
  text:t('ลงปุ๊บ: +1 ต่อการ์ดเราอีกแต่ละใบในสนามนี้ (สูงสุด +3)','On Reveal: +1 for each other card of yours here (max +3).'),
  reveal:(E,c)=>E.buff(c,Math.min(3,E.allies(c,{here:true,other:true}).length)),
  lore:t('การแข่งเรือเมืองน่านขึ้นชื่อจนอยู่ในคำขวัญจังหวัด','Nan\'s boat races are famous enough to be in the provincial motto.')});
card({id:'saltmaker',prov:['nn'],type:'job',cost:2,power:2,name:t('คนต้มเกลือบ่อเกลือ','Bo Kluea Salt Maker'),
  text:t('ลงปุ๊บ: การ์ดศัตรู 1 ใบในสนามนี้ -1','On Reveal: An enemy card here gets -1.'),
  reveal:(E,c)=>{ const e=E.pickEnemy(c,{here:true}); if(e) E.buff(e,-1); },
  lore:t('อำเภอบ่อเกลือของน่าน ชื่อแปลตรงตัวว่าบ่อเกลือ เป็นแหล่งเกลือบนภูเขา','Bo Kluea in Nan literally means "salt well", a mountain source of salt.')});
card({id:'phukha',prov:['nn'],type:'legend',cost:5,power:7,name:t('พญาภูคา','Phaya Phukha'),
  text:t('ต่อเนื่อง: การ์ด นน. อื่นของเราในสนามนี้ +1','Ongoing: Your other Nan cards here have +1.'),
  aura:(E,s,x)=>x!==s&&x.owner===s.owner&&x.loc===s.loc&&has(x,'nn')?1:0,
  lore:t('ต้นราชวงศ์ภูคาของนครน่าน ชื่อของท่านอยู่คู่กับดอยภูคา','Founder of Nan\'s Phukha dynasty, remembered in the name Doi Phu Kha.')});
card({id:'pumanyaman',prov:['nn'],type:'legend',cost:2,power:2,name:t('ปู่ม่านย่าม่าน','Pu Man Ya Man'),
  text:t('ลงปุ๊บ: ถ้ามีการ์ดเราอีกใบลงสนามนี้ในเทิร์นเดียวกัน ทั้งสองใบ +2','On Reveal: If you played another card here this turn, both get +2.'),
  reveal:(E,c)=>{ const p=E.allies(c,{here:true,other:true}).find(a=>a.turnPlayed===E.turn); if(p){ E.buff(p,2); E.buff(c,2); } },
  lore:t('ภาพ "กระซิบรักบันลือโลก" บนผนังวัดภูมินทร์ ฝีมือหนานบัวผัน วาดช่วง พ.ศ. 2410–2417','The "whisper of love" mural at Wat Phumin, painted by Nan Bua Phan in 1867–1874.')});
card({id:'usuparat',prov:['nn'],type:'animal',cost:5,power:7,name:t('วัวอุสุภราช','Usuparat the Sacred Bull'),
  text:t('ต่อเนื่อง: +3 ถ้าช่องวัดเป็นวัดพระธาตุแช่แห้ง','Ongoing: +3 while the temple slot holds Wat Phra That Chae Haeng.'),
  aura:(E,s,x)=>x===s&&E.templeId()==='chaehaeng'?3:0,
  lore:t('ตราจังหวัดน่านเป็นรูปวัวอุสุภราชแบกพระธาตุแช่แห้ง','Nan\'s seal shows the sacred bull Usuparat carrying the Chae Haeng chedi.')});
card({id:'blackivory',prov:['nn'],type:'item',cost:3,power:0,name:t('งาช้างดำ','Black Ivory'),
  text:t('ลงปุ๊บ: การ์ด นน. 1 ใบในสนามนี้ +3 และ "ป้องกัน" แล้วการ์ดนี้หายไป','On Reveal: A Nan card here gets +3 and Shield. Then this card vanishes.'),
  reveal:(E,c)=>{ const a=E.pickAlly(c,{here:true,other:true,pred:x=>has(x,'nn')}); if(a){ E.buff(a,3); E.shield(a); } E.remove(c); },
  lore:t('สมบัติคู่บ้านคู่เมืองน่าน เชื่อว่าได้มาจากเชียงตุง เก็บรักษาที่พิพิธภัณฑสถานแห่งชาติน่าน (หอคำเดิม)','Nan\'s treasured heirloom, believed to come from Chiang Tung, kept at the Nan National Museum.')});
card({id:'goldenorange',prov:['nn'],type:'item',cost:1,power:0,name:t('ส้มสีทอง','Golden Orange'),
  text:t('ลงปุ๊บ: การ์ดเรา 1 ใบในสนามนี้ +2 แล้วการ์ดนี้หายไป','On Reveal: A card of yours here gets +2. Then this card vanishes.'),
  reveal:(E,c)=>{ const a=E.pickAlly(c,{here:true,other:true}); if(a) E.buff(a,2); E.remove(c); },
  lore:t('ส้มสีทองของน่านอยู่ในคำขวัญจังหวัด','Nan\'s golden oranges are named in the provincial motto.')});
card({id:'chaehaeng',prov:['nn'],type:'temple',cost:4,power:0,name:t('วัดพระธาตุแช่แห้ง','Wat Phra That Chae Haeng'),
  text:t('วัด: การ์ด นน. ทุกใบ (ทั้งสองฝ่าย) +2','Temple: All Nan cards (both sides) +2.'),temple:'nn',
  lore:t('พระธาตุคู่เมืองน่าน ปรากฏบนตราจังหวัด','Nan\'s great chedi, shown on the provincial seal.')});
/* ---------- Phrae ---------- */
card({id:'morhom',prov:['pr'],type:'job',cost:2,power:2,name:t('ช่างย้อมหม้อห้อม','Mor Hom Indigo Dyer'),
  text:t('ลงปุ๊บ: ให้การ์ดเราอีก 1 ใบในสนามนี้ "ป้องกัน" และ +1','On Reveal: Another card of yours here gets Shield and +1.'),
  reveal:(E,c)=>{ const a=E.pickAlly(c,{here:true,other:true}); if(a){ E.shield(a); E.buff(a,1); } },
  lore:t('ผ้าหม้อห้อมของแพร่อยู่ในคำขวัญจังหวัด คู่กับไม้สัก','Phrae\'s mor hom cloth appears in the provincial motto, alongside teak.')});
card({id:'teakcarpenter',prov:['pr','ut'],type:'job',cost:4,power:5,name:t('ช่างไม้สัก','Teak Carpenter'),
  text:t('ต่อเนื่อง: การ์ดนี้ย้ายไม่ได้ และถูกลดพลังไม่ได้','Ongoing: Can\'t be moved or lose power.'),steady:true,
  lore:t('ไม้สักอยู่ในคำขวัญของแพร่และอุตรดิตถ์ และเป็นต้นไม้ประจำจังหวัดอุตรดิตถ์','Teak is in the mottos of Phrae and Uttaradit, and is Uttaradit\'s provincial tree.')});
card({id:'phralo',prov:['pr'],type:'legend',cost:4,power:5,name:t('พระลอ','Phra Lo'),
  text:t('ต่อเนื่อง: +4 ถ้า "พระเพื่อนพระแพง" ของเราอยู่ในสนามเดียวกัน','Ongoing: +4 if your Phuean & Phaeng are at this location.'),
  aura:(E,s,x)=>x===s&&E.allies(s,{here:true,other:true}).some(a=>a.def.id==='phuean')?4:0,
  lore:t('ตัวเอกในลิลิตพระลอ วรรณคดีรักที่ชาวแพร่ภูมิใจ อยู่ในคำขวัญจังหวัด','Hero of Lilit Phra Lo, the love epic Phrae proudly names in its motto.')});
card({id:'phuean',prov:['pr'],type:'legend',cost:3,power:4,name:t('พระเพื่อนพระแพง','Phuean & Phaeng'),
  text:t('ลงปุ๊บ: ถ้าพระลอของเราอยู่ในมือ ลดพลังงานของพระลอลง 1','On Reveal: If Phra Lo is in your hand, it costs 1 less.'),
  reveal:(E,c)=>{ const h=E.hand(c.owner).find(x=>x.def.id==='phralo'); if(h) h.costMod=(h.costMod||0)-1; },
  lore:t('สองพี่น้องในลิลิตพระลอ ผู้ส่งคำเชิญจนพระลอเดินทางมาหา','The two sisters of Lilit Phra Lo whose call drew Phra Lo to them.')});
card({id:'nangkhoi',prov:['pr'],type:'legend',cost:2,power:1,name:t('นางคอย','Nang Khoi'),
  text:t('จบเทิร์น: +1 ถ้าเทิร์นนี้ไม่มีการ์ดเราใบอื่นลงสนามนี้','End of turn: +1 if no other card of yours was played here this turn.'),
  endTurn:(E,c)=>{ if(!E.allies(c,{here:true,other:true}).some(a=>a.turnPlayed===E.turn)) E.buff(c,1); },
  lore:t('ตำนานถ้ำผานางคอย หญิงสาวรอคนรักจนกลายเป็นหิน เห็นเป็นหินงอกรูปหญิงอุ้มลูก','At Tham Pha Nang Khoi, a woman waited for her love until she turned to stone, a stalagmite holding a child.')});
card({id:'horse',prov:['pr'],type:'animal',cost:2,power:3,name:t('ม้าแพร่','Horse of Phrae'),
  text:t('ลงปุ๊บ: ย้ายตัวเองไปสนามที่เรากำลังแพ้อยู่ได้','On Reveal: Move itself to a location you are losing.'),
  reveal:(E,c)=>E.moveToLosing(c),
  lore:t('ตำนานเล่าว่าเจ้าเมืองแพร่ขี่ม้า เจ้าเมืองน่านขี่ควาย มาพบกันบนยอดเขาเพื่อแบ่งเขตแดน ตราจังหวัดแพร่จึงเป็นรูปม้า','Legend says the lord of Phrae rode a horse and the lord of Nan a buffalo to divide their lands, so Phrae\'s seal is a horse.')});
card({id:'chohae',prov:['pr'],type:'temple',cost:4,power:0,name:t('วัดพระธาตุช่อแฮ','Wat Phra That Cho Hae'),
  text:t('วัด: การ์ด พร. ทุกใบ (ทั้งสองฝ่าย) +2','Temple: All Phrae cards (both sides) +2.'),temple:'pr',
  lore:t('พระธาตุคู่เมืองแพร่ อยู่ห่างตัวเมืองราว 9 กม. และอยู่บนหลังม้าในตราจังหวัด','Phrae\'s great chedi, about 9 km from town, carried by the horse on the seal.')});
/* ---------- Phayao ---------- */
card({id:'fisher',prov:['py'],type:'job',cost:2,power:2,name:t('ชาวประมงกว๊านพะเยา','Kwan Phayao Fisher'),
  text:t('ลงปุ๊บ: จั่วการ์ดสัตว์ 1 ใบจากกองการ์ด (ถ้ามี)','On Reveal: Draw an Animal from your deck (if any).'),
  reveal:(E,c)=>E.drawWhere(c.owner,x=>x.def.type==='animal'),
  lore:t('กว๊านพะเยาเป็นแหล่งปลาน้ำจืดใหญ่ที่สุดในภาคเหนือตอนบน และห้ามใช้เรือติดเครื่องยนต์','Kwan Phayao is the upper north\'s largest freshwater fish habitat. Motorboats are banned.')});
card({id:'hyacinth',prov:['py'],type:'job',cost:3,power:3,name:t('ช่างจักสานผักตบชวา','Water Hyacinth Weaver'),
  text:t('ต่อเนื่อง: การ์ดของดีของเราทุกสนาม +1','Ongoing: Your Treasures everywhere have +1.'),
  aura:(E,s,x)=>x.owner===s.owner&&x.def.type==='item'?1:0,
  lore:t('พะเยามีงานจักสานจากผักตบชวา และผ้าฝ้ายทอมือของชาวไทลื้อ','Phayao makes crafts from water hyacinth, and Thai Lue hand-woven cotton.')});
card({id:'ngammueang',prov:['py'],type:'legend',cost:5,power:7,name:t('พ่อขุนงำเมือง','Pho Khun Ngam Mueang'),
  text:t('ลงปุ๊บ: ให้การ์ดเราทุกใบในสนามนี้ "ป้องกัน"','On Reveal: Shield all your cards here.'),
  reveal:(E,c)=>{ for(const a of E.allies(c,{here:true})) E.shield(a); },
  lore:t('ครองพะเยาตั้งแต่ พ.ศ. 1801 (ค.ศ. 1258) เป็นสหายของพ่อขุนรามคำแหง ตำนานว่าชื่อของท่านแปลว่า "ผู้ให้ร่มเงาแก่แผ่นดิน" เพราะบังคับฟ้าฝนได้','Ruled Phayao from 1258 and was a friend of Ramkhamhaeng. Legend says his name means "the one who shades the land" for his power over the weather.')});
card({id:'khunchueang',prov:['py'],type:'legend',cost:6,power:8,name:t('ขุนเจือง','Khun Chueang'),
  text:t('ลงปุ๊บ: +1 ต่อการ์ดศัตรูแต่ละใบในสนามนี้','On Reveal: +1 for each enemy card here.'),
  reveal:(E,c)=>E.buff(c,E.enemies(c,{here:true}).length),
  lore:t('วีรบุรุษในมหากาพย์ท้าวฮุ่งท้าวเจือง เรื่องเล่าที่เล่าขานในแถบพะเยาและลุ่มน้ำโขง','The warrior hero of the Thao Hung–Thao Chueang epic, told around Phayao and the Mekong.')});
card({id:'peacock',prov:['py'],type:'animal',cost:2,power:2,name:t('นกยูง','Green Peafowl'),
  text:t('ลงปุ๊บ: การ์ดศัตรูที่พลังสูงสุดในสนามนี้ "สับสน"','On Reveal: Confuse the strongest enemy card here.'),
  reveal:(E,c)=>E.status(E.strongestEnemy(c),'confuse'),
  lore:t('อุทยานแห่งชาติดอยภูนาง จ.พะเยา ขึ้นชื่อเรื่องนกยูง ซึ่งผสมพันธุ์ช่วงมกราคมถึงมีนาคม','Doi Phu Nang National Park in Phayao is known for peafowl, which breed January to March.')});
card({id:'sikhomkham',prov:['py'],type:'temple',cost:4,power:0,name:t('วัดศรีโคมคำ','Wat Si Khom Kham'),
  text:t('วัด: การ์ด พย. ทุกใบ (ทั้งสองฝ่าย) +2','Temple: All Phayao cards (both sides) +2.'),temple:'py',
  lore:t('วัดริมกว๊านพะเยา ที่ประดิษฐานพระเจ้าตนหลวง พระพุทธรูปศิลปะล้านนาที่ใหญ่ที่สุด สูงราว 18 เมตร','On the shore of Kwan Phayao, home of Phra Chao Ton Luang, the largest Lanna-style Buddha, about 18 m tall.')});
/* ---------- Uttaradit ---------- */
card({id:'namphi',prov:['ut'],type:'job',cost:3,power:3,name:t('ช่างตีเหล็กน้ำพี้','Namphi Blacksmith'),
  text:t('ลงปุ๊บ: การ์ดฮีโร่และตำนานอื่นของเราในสนามนี้ +1','On Reveal: Your other heroes and legends here get +1.'),
  reveal:(E,c)=>{ for(const a of E.allies(c,{here:true,other:true})) if(a.def.type==='job'||a.def.type==='legend') E.buff(a,1); },
  lore:t('เหล็กน้ำพี้ของอุตรดิตถ์ขึ้นชื่อจนอยู่ในคำขวัญจังหวัด ใช้ตีดาบมาแต่โบราณ','Uttaradit\'s Namphi iron, named in the provincial motto, has long been forged into swords.')});
card({id:'langsat',prov:['ut'],type:'job',cost:1,power:2,name:t('ชาวสวนลางสาด','Langsat Grower'),
  text:t('ชาวสวนผู้ขยันขันแข็ง','A hard-working orchard keeper.'),
  lore:t('ลางสาดขึ้นชื่อของอุตรดิตถ์ มีเทศกาลช่วงกลางถึงปลายกันยายน','Uttaradit\'s famous langsat, with a festival in mid to late September.')});
card({id:'phichai',prov:['ut'],type:'legend',cost:5,power:6,name:t('พระยาพิชัยดาบหัก','Phraya Phichai Dap Hak'),
  text:t('ต่อเนื่อง: +4 ถ้าศัตรูมีการ์ดในสนามนี้มากกว่าเรา','Ongoing: +4 while the enemy has more cards here than you.'),
  aura:(E,s,x)=>x===s&&E.enemies(s,{here:true}).length>E.allies(s,{here:true}).length?4:0,
  lore:t('ขุนศึกสมัยกรุงธนบุรี พ.ศ. 2316 รบกับทัพพม่าที่เมืองพิชัยจนดาบหักไปข้างหนึ่ง แต่ยังสู้ต่อจนทัพพม่าถอย','A Thonburi-era general. In 1773 he fought a Burmese army at Phichai until one sword broke, and fought on until they withdrew.')});
card({id:'laplae',prov:['ut'],type:'legend',cost:3,power:4,name:t('แม่ญิงเมืองลับแล','Lady of Laplae'),
  text:t('ต่อเนื่อง: ศัตรูเลือกการ์ดนี้เป็นเป้าหมายไม่ได้','Ongoing: Enemies can\'t target this card.'),hidden:true,
  lore:t('ตำนานเมืองลับแลที่มีแต่ผู้หญิง ผู้ชายที่เข้าไปต้องไม่พูดโกหก ใครผิดคำจะถูกส่งออกจากเมือง พร้อมขมิ้นที่กลายเป็นทอง','The legend of Laplae, a hidden town of women where men must never lie. A man who broke his word was sent away with turmeric that turned to gold.')});
card({id:'durian',prov:['ut'],type:'item',cost:2,power:0,name:t('ทุเรียนหลงลับแล','Long Laplae Durian'),
  text:t('ลงปุ๊บ: การ์ดเรา 1 ใบในสนามนี้ +3 (ถ้าเป็น อต. +4) แล้วการ์ดนี้หายไป','On Reveal: A card of yours here gets +3 (+4 if Uttaradit). Then this card vanishes.'),
  reveal:(E,c)=>{ const a=E.pickAlly(c,{here:true,other:true}); if(a) E.buff(a,has(a,'ut')?4:3); E.remove(c); },
  lore:t('ทุเรียนพันธุ์หลงลับแลและหลินลับแลของอุตรดิตถ์ขึ้นชื่อเรื่องกลิ่นไม่แรง มีเทศกาลราวต้นมิถุนายน','Uttaradit\'s Long and Lin Laplae durians are prized for their mild smell, celebrated in early June.')});
card({id:'namphisword',prov:['ut'],type:'item',cost:1,power:0,name:t('ดาบเหล็กน้ำพี้','Namphi Sword'),
  text:t('ลงปุ๊บ: การ์ดตำนานของเรา 1 ใบในสนามนี้ +3 แล้วการ์ดนี้หายไป','On Reveal: A Legend of yours here gets +3. Then this card vanishes.'),
  reveal:(E,c)=>{ const a=E.pickAlly(c,{here:true,other:true,pred:x=>x.def.type==='legend'}); if(a) E.buff(a,3); E.remove(c); },
  lore:t('ดาบที่ตีจากเหล็กน้ำพี้ เหล็กขึ้นชื่อของอุตรดิตถ์','A blade forged from Uttaradit\'s famous Namphi iron.')});
card({id:'phrathaen',prov:['ut'],type:'temple',cost:4,power:0,name:t('วัดพระแท่นศิลาอาสน์','Wat Phra Thaen Sila At'),
  text:t('วัด: การ์ด อต. ทุกใบ (ทั้งสองฝ่าย) +2','Temple: All Uttaradit cards (both sides) +2.'),temple:'ut',
  lore:t('มณฑปของวัดนี้ใน อ.ลับแล อยู่บนตราจังหวัดอุตรดิตถ์','The mondop of this temple in Laplae district appears on Uttaradit\'s seal.')});
/* ---------- Neutral Lanna food ---------- */
card({id:'stickyrice',prov:['ln'],type:'food',cost:2,power:0,name:t('ข้าวเหนียว','Sticky Rice'),
  text:t('ลงปุ๊บ: การ์ดเราทุกใบในสนามนี้ +1 แล้วการ์ดนี้หายไป','On Reveal: Your cards here get +1. Then this card vanishes.'),
  reveal:(E,c)=>{ for(const a of E.allies(c,{here:true,other:true})) E.buff(a,1); E.remove(c); },
  lore:t('อาหารหลักของคนเหนือ กินคู่กับกับข้าวได้แทบทุกอย่าง','The northern staple that goes with almost everything.')});
card({id:'namphrik',prov:['ln'],type:'food',cost:2,power:0,name:t('น้ำพริกหนุ่ม','Nam Phrik Num'),
  text:t('ลงปุ๊บ: การ์ดศัตรูทุกใบในสนามนี้ -1 แล้วการ์ดนี้หายไป','On Reveal: Enemy cards here get -1. Then this card vanishes.'),
  reveal:(E,c)=>{ for(const e of E.enemies(c,{here:true})) E.buff(e,-1); E.remove(c); },
  lore:t('น้ำพริกพริกหนุ่มย่าง เผ็ดหอม กินกับแคบหมูและผักนึ่ง','Roasted green chilli dip, eaten with pork crackling and steamed greens.')});
card({id:'hangle',prov:['ln'],type:'food',cost:3,power:1,name:t('แกงฮังเล','Kaeng Hang Le'),
  text:t('จบเทิร์น: +1 ทุกเทิร์น (ต้องเคี่ยวนาน)','End of turn: +1 each turn (slow-cooked).'),
  endTurn:(E,c)=>E.buff(c,1),
  lore:t('แกงหมูรสเข้มแบบล้านนาที่ได้อิทธิพลจากพม่า ต้องเคี่ยวนานจนหมูนุ่ม','A rich Lanna pork curry with Burmese influence, simmered until tender.')});
card({id:'khaepmu',prov:['ln'],type:'food',cost:1,power:1,name:t('แคบหมู','Khaep Mu'),
  text:t('ลงปุ๊บ: การ์ดศัตรูที่ลงสนามนี้ในเทิร์นนี้ -1','On Reveal: Enemy cards played here this turn get -1.'),
  reveal:(E,c)=>{ for(const e of E.enemies(c,{here:true})) if(e.turnPlayed===E.turn) E.buff(e,-1); },
  lore:t('หนังหมูทอดกรอบ เสียงดังกรุบ กินคู่น้ำพริกหนุ่ม','Crispy pork crackling, the crunchy partner of nam phrik num.')});
card({id:'khaosoi',prov:['ln'],type:'food',cost:2,power:2,name:t('ข้าวซอย','Khao Soi'),
  text:t('ลงปุ๊บ: ลบสถานะผิดปกติของการ์ดเราทุกใบในสนามนี้ และ +1 ให้ใบที่ถูกลบ','On Reveal: Clear bad statuses from your cards here. Each cleared card gets +1.'),
  reveal:(E,c)=>{ for(const a of E.allies(c,{here:true,other:true})) if(E.cleanse(a)) E.buff(a,1); },
  lore:t('บะหมี่น้ำแกงกะทิ โรยหมี่กรอบ อุ่นท้องในวันหนาว','Curry-coconut noodles topped with crispy noodles, warming on a cold day.')});
card({id:'khanomjeen',prov:['ln'],type:'food',cost:4,power:2,name:t('ขนมจีนน้ำเงี้ยว','Khanom Jeen Nam Ngiao'),
  text:t('ลงปุ๊บ: การ์ดเราทุกใบทุกสนาม +1 แล้วการ์ดนี้หายไป','On Reveal: All your cards everywhere get +1. Then this card vanishes.'),
  reveal:(E,c)=>{ for(const a of E.allies(c,{other:true})) E.buff(a,1); E.remove(c); },
  lore:t('ขนมจีนราดน้ำเงี้ยวใส่มะเขือเทศและดอกงิ้ว อาหารพื้นเมืองยอดนิยม','Rice noodles in a tomato pork broth with dried cotton flowers.')});
card({id:'saiua',prov:['ln'],type:'food',cost:2,power:2,name:t('ไส้อั่ว','Sai Ua'),
  text:t('ลงปุ๊บ: การ์ดศัตรู 1 ใบในสนามนี้ "สับสน"','On Reveal: Confuse an enemy card here.'),
  reveal:(E,c)=>E.status(E.pickEnemy(c,{here:true}),'confuse'),
  lore:t('ไส้กรอกสมุนไพรแบบเหนือ ใส่ตะไคร้ ใบมะกรูด พริกแกง ย่างไฟอ่อน','Northern herb sausage with lemongrass and kaffir lime, slow-grilled.')});
card({id:'larb',prov:['ln'],type:'food',cost:3,power:3,name:t('ลาบเหนือ','Larb Mueang'),
  text:t('ลงปุ๊บ: การ์ดทุกใบในสนามนี้ (ทั้งสองฝ่าย) +1 กินร่วมวง','On Reveal: Every card here (both sides) gets +1. Shared meal!'),
  reveal:(E,c)=>{ for(const a of E.allies(c,{here:true,other:true})) E.buff(a,1); for(const e of E.enemies(c,{here:true})) E.buff(e,1); },
  lore:t('ลาบสูตรเหนือใช้พริกลาบเครื่องเทศหลายชนิด นิยมทำกินร่วมกันในงานบุญ','Northern larb uses a spiced chilli mix and is made to share at festivals.')});
const CARDS={}; for(const c of C) CARDS[c.id]=c;

/* ---------- battlefields (never temples) ---------- */
const LOCS=[
  {id:'inthanon',prov:'cm',name:t('ดอยอินทนนท์','Doi Inthanon'),text:t('หนาวจัด: การ์ดที่ลงที่นี่ -1','Freezing: Cards played here get -1.'),onPlay:(E,l,c)=>E.buff(c,-1),
   lore:t('ยอดเขาสูงที่สุดในไทย 2,565 เมตร เคยวัดอุณหภูมิได้ -5 °C (ธันวาคม 2560)','Thailand\'s highest peak at 2,565 m. It once hit −5 °C (December 2017).'),maps:'ดอยอินทนนท์'},
  {id:'goldentriangle',prov:'cr',name:t('สามเหลี่ยมทองคำ','Golden Triangle'),text:t('สามแผ่นดิน: แต่ละฝ่ายลงได้แค่ 3 ใบ','Three lands: Each side can play only 3 cards here.'),cap:3,
   lore:t('จุดที่พรมแดนไทย ลาว และเมียนมามาบรรจบกัน','Where the borders of Thailand, Laos and Myanmar meet.'),maps:'สามเหลี่ยมทองคำ เชียงราย'},
  {id:'phuchifa',prov:'cr',name:t('ภูชี้ฟ้า','Phu Chi Fa'),text:t('ทะเลหมอก: การ์ดที่ลงเทิร์น 1–2 ที่นี่ +2','Sea of mist: Cards played here on turns 1–2 get +2.'),onPlay:(E,l,c)=>{ if(E.turn<=2) E.buff(c,2); },
   lore:t('อุทยานแห่งชาติแห่งหนึ่งของเชียงราย ขึ้นชื่อเรื่องจุดชมทะเลหมอก','One of Chiang Rai\'s national parks, loved for its sea-of-mist views.'),maps:'ภูชี้ฟ้า'},
  {id:'clocktower',prov:'lp',name:t('ห้าแยกหอนาฬิกา','Five-way Clock Tower'),text:t('ห้าแยก: แต่ละฝ่ายลงได้ถึง 5 ใบ','Five-way: Each side can play up to 5 cards here.'),cap:5,
   lore:t('หอนาฬิกากลางห้าแยกใจกลางเมืองลำปาง ฉลองครบ 70 ปีเมื่อปลายปี พ.ศ. 2568','The clock tower at the heart of Lampang, which celebrated its 70th anniversary at the end of 2025.'),maps:'ห้าแยกหอนาฬิกา ลำปาง'},
  {id:'kadkongta',prov:'lp',name:t('กาดกองต้า','Kad Kong Ta'),text:t('ถนนคนเดิน: ของกินที่ลงเทิร์น 5–6 ได้ผลสองเท่า','Walking street: Food played here on turns 5–6 triggers twice.'),doubleFood:true,
   lore:t('ถนนเก่าริมแม่น้ำวัง เปิดเป็นถนนคนเดินเย็นวันเสาร์–อาทิตย์','An old riverside street that becomes a walking street on weekend evenings.'),maps:'กาดกองต้า ลำปาง'},
  {id:'khuntan',prov:'lu',name:t('อุโมงค์ขุนตาน','Khun Tan Tunnel'),text:t('ทะลุอุโมงค์: จบเทิร์น การ์ดใบล่าสุดที่ลงที่นี่ย้ายไปสนามขวามือ','Through the tunnel: At end of turn, the last card played here moves to the right.'),tunnel:true,
   lore:t('อุโมงค์รถไฟยาว 1,352 เมตร สร้างเสร็จ พ.ศ. 2461 ระหว่างลำพูนกับลำปาง','A 1,352 m railway tunnel between Lamphun and Lampang, finished in 1918.'),maps:'อุโมงค์ขุนตาน'},
  {id:'buatongfield',prov:'ms',name:t('ทุ่งบัวตองดอยแม่อูคอ','Bua Tong Fields'),text:t('ทุ่งดอกไม้: การ์ดสัตว์ที่นี่ +2','Flower fields: Animals here have +2.'),aura:(E,l,c)=>c.def.type==='animal'?2:0,
   lore:t('ทุ่งดอกบัวตองบานเหลืองทั้งดอยใน อ.ขุนยวม ช่วงปลายปี','Golden bua tong blooms cover the hills of Khun Yuam late in the year.'),maps:'ทุ่งบัวตอง ดอยแม่อูคอ'},
  {id:'pangung',prov:'ms',name:t('ปางอุ๋ง','Pang Oung'),text:t('อ่างเก็บน้ำสงบ: สถานะผิดปกติใช้ไม่ได้ที่นี่','Still waters: Bad statuses have no effect here.'),calm:true,
   lore:t('อ่างเก็บน้ำกลางป่าสนใน อ.เมืองแม่ฮ่องสอน','A reservoir among pine forests in Mueang Mae Hong Son.'),maps:'ปางอุ๋ง'},
  {id:'phukha',prov:'nn',name:t('ดอยภูคา','Doi Phu Kha'),text:t('ป่าสูง: การ์ดราคา 1–2 ที่นี่ +1','Highland forest: 1–2 cost cards here have +1.'),aura:(E,l,c)=>E.cost(c)<=2?1:0,
   lore:t('อุทยานแห่งชาติของน่าน ป่าไม้ปกคลุมน่านกว่า 61%','A national park in Nan, a province over 61% forest.'),maps:'อุทยานแห่งชาติดอยภูคา'},
  {id:'phaemuangphi',prov:'pr',name:t('แพะเมืองผี','Phae Mueang Phi'),text:t('เสาดินหลอน: จบเทิร์น การ์ดสุ่ม 1 ใบที่นี่ "สับสน"','Haunted pillars: At end of turn, a random card here is Confused.'),haunt:true,
   lore:t('เสาดินที่เกิดจากการกัดเซาะตามธรรมชาติ ชื่อแปลประมาณ "ป่าเมืองผี" ห่างตัวเมืองแพร่ราว 8 กม.','Eroded earth pillars about 8 km from Phrae; the name means roughly "ghost town grove".'),maps:'แพะเมืองผี'},
  {id:'kwanphayao',prov:'py',name:t('กว๊านพะเยา','Kwan Phayao'),text:t('ทะเลสาบใหญ่: การ์ด พย. และสัตว์ที่นี่ +1','Great lake: Phayao cards and Animals here have +1.'),aura:(E,l,c)=>(has(c,'py')||c.def.type==='animal')?1:0,
   lore:t('แหล่งปลาน้ำจืดใหญ่ที่สุดในภาคเหนือตอนบน','The largest freshwater fish habitat of the upper north.'),maps:'กว๊านพะเยา'},
  {id:'sirikit',prov:'ut',name:t('เขื่อนสิริกิติ์','Sirikit Dam'),text:t('ประตูน้ำปิด: หลังเทิร์น 4 ลงการ์ดที่นี่ไม่ได้','Floodgates shut: No cards can be played here after turn 4.'),closeAfter:4,
   lore:t('เขื่อนทางเหนือของตัวเมืองอุตรดิตถ์ราว 45 กม. อ่างเก็บน้ำกว้างราว 250 ตร.กม.','About 45 km north of Uttaradit town, with a reservoir of about 250 km².'),maps:'เขื่อนสิริกิติ์'},
  {id:'tonsakyai',prov:'ut',name:t('ต้นสักใหญ่','Ton Sak Yai'),text:t('ไม้สักพันปี: การ์ดราคา 4 ขึ้นไปที่นี่ +2','Ancient teak: 4+ cost cards here have +2.'),aura:(E,l,c)=>E.cost(c)>=4?2:0,
   lore:t('ต้นสักที่ใหญ่ที่สุดในโลก อายุประมาณ 1,500 ปี สูงราว 37 เมตร','The world\'s largest teak tree, about 1,500 years old and 37 m tall.'),maps:'อุทยานแห่งชาติต้นสักใหญ่'},
  {id:'lamphunwall',prov:'lu',name:t('กำแพงเมืองลำพูน','Lamphun City Wall'),text:t('กำแพงเมือง: การ์ดที่นี่ถูกลดพลังไม่ได้','City wall: Cards here can\'t lose power.'),wall:true,
   lore:t('กำแพงเมืองเก่าของหริภุญชัย เมืองมอญที่อยู่เหนือสุดของทวารวดี','The old wall of Haripunchai, the northernmost Mon Dvaravati city.'),maps:'กำแพงเมืองลำพูน'},
];
const LOCMAP={}; for(const l of LOCS) LOCMAP[l.id]=l;
const STARTER_DECKS={
  lanna:['rooster','teafarmer','bosang','carriage','horse','morhom','bowlpainter','wualai','elephantlp','lampangluang','khanomjeen','thipchang'],
  ai1:['langsat','kuptai','saltmaker','peacock','pumanyaman','namphi','waterelephant','phuean','phralo','phichai','ngammueang','khunchueang'],
};
