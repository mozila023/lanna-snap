/* ===== Lanna Snap — card set 2: legends, spirits, rituals, myths, festivals, crafts, food (facts: RESEARCH.md §set 2) ===== */
TYPES.ghost=t('ภูติผี','Spirit'); TYPES.ritual=t('พิธีกรรม','Ritual'); TYPES.myth=t('สัตว์ในตำนาน','Myth'); TYPES.fest=t('เทศกาล','Festival');
const isGhost=x=>x&&x.def.type==='ghost';

/* ---------- legends ---------- */
card({id:'dararasmi',prov:['cm'],type:'legend',cost:4,power:5,name:t('พระราชชายา เจ้าดารารัศมี','Princess Dara Rasmi'),
  text:t('ลงปุ๊บ: การ์ดของดีและของกินของเราทุกสนาม +1','On Reveal: Your Treasures and Food everywhere get +1.'),
  reveal:(E,c)=>{ for(const a of E.allies(c,{other:true})) if(a.def.type==='item'||a.def.type==='food') E.buff(a,1); },
  lore:t('พระราชชายาในรัชกาลที่ 5 ธิดาของพระเจ้าอินทวิชยานนท์ ประสูติ พ.ศ. 2416 เมื่อกลับมาประทับเชียงใหม่ ทรงส่งเสริมการเกษตร ฟ้อนรำ และผ้าทอล้านนา และตั้งสวนเจ้าสบายที่แม่ริม','A royal consort of King Chulalongkorn and daughter of Prince Inthawichayanon, born 1873. Back in Chiang Mai she championed farming, Lanna dance and weaving, and founded the Suan Chao Sabai garden in Mae Rim.')});
card({id:'chiraprapha',prov:['cm'],type:'legend',cost:3,power:3,name:t('พระมหาเทวีจิรประภา','Queen Chiraprapha'),
  text:t('ลงปุ๊บ: การ์ดศัตรูที่พลังสูงสุดในสนามนี้ "หลับ" (การเจรจาหยุดศึก)','On Reveal: The strongest enemy card here falls Asleep (talks stop the battle).'),
  reveal:(E,c)=>E.status(E.strongestEnemy(c),'sleep'),
  lore:t('กษัตริย์หญิงของล้านนา ครองราชย์ราว พ.ศ. 2088–2089 ในยามที่อยุธยายกทัพมา ทรงเลือกใช้การเจรจาเพื่อรักษาเมือง','A queen regnant of Lan Na around 1545–1546. When an Ayutthaya army came north she chose negotiation to protect the city.')});
card({id:'wisutthithewi',prov:['cm'],type:'legend',cost:5,power:6,name:t('พระนางวิสุทธิเทวี','Queen Wisutthithewi'),
  text:t('จบเทิร์น: ถ้าเรากำลังแพ้ในสนามนี้ การ์ดนี้ +2','End of Turn: If you are losing here, this gets +2.'),
  endTurn:(E,c)=>{ if(E.losingHere(c)) E.buff(c,2); },
  lore:t('ผู้ครองเชียงใหม่ในช่วงที่ล้านนาอยู่ใต้อำนาจพม่า ราว พ.ศ. 2107–2121 นับเป็นกษัตริย์ราชวงศ์มังรายพระองค์สุดท้าย','Ruler of Chiang Mai while Lan Na was under Burmese rule, around 1564–1578, and counted as the last monarch of the Mangrai dynasty.')});
card({id:'singhanat',prov:['ms'],type:'legend',cost:4,power:4,name:t('พญาสิงหนาทราชา','Phraya Singhanat Racha'),
  text:t('ลงปุ๊บ: การ์ด มส. ของเราทุกสนาม +1 ถ้ามีช้างของเราในสนามนี้ การ์ดนี้ +2','On Reveal: Your Mae Hong Son cards everywhere get +1. If you have an elephant here, this gets +2.'),
  reveal:(E,c)=>{ for(const a of E.allies(c,{other:true})) if(has(a,'ms')) E.buff(a,1); if(E.allies(c,{here:true,other:true}).some(a=>/elephant/.test(a.def.id))) E.buff(c,2); },
  lore:t('ชาวไทใหญ่ผู้ได้รับแต่งตั้งเป็นเจ้าเมืองแม่ฮ่องสอนคนแรก สมัยเจ้าหลวงเชียงใหม่ ราว พ.ศ. 2417','A Shan leader appointed the first governor of Mae Hong Son by the ruler of Chiang Mai, around 1874.')});
card({id:'anantaworarit',prov:['nn'],type:'legend',cost:5,power:7,name:t('เจ้าอนันตวรฤทธิเดช','Chao Anantaworarittidet'),
  text:t('ต่อเนื่อง: ปู่ม่านย่าม่านของเรา +3 และการ์ดพิธีกรรมของเราในสนามนี้ +1','Ongoing: Your Pu Man Ya Man has +3 and your Rituals here have +1.'),
  aura:(E,s,x)=>x.owner!==s.owner?0:x.def.id==='pumanyaman'?3:(x.loc===s.loc&&x.def.type==='ritual'?1:0),
  lore:t('เจ้าผู้ครองนครน่าน ครองเมือง พ.ศ. 2395–2434 ทรงบูรณะวัดภูมินทร์ ซึ่งมีจิตรกรรมฝาผนังปู่ม่านย่าม่านอันโด่งดัง','Ruler of Nan 1852–1891. He restored Wat Phumin, home of the famous Pu Man Ya Man mural.')});
card({id:'phiriya',prov:['pr'],type:'legend',cost:4,power:4,name:t('เจ้าพิริยเทพวงษ์','Chao Phiriya Thepphawong'),
  text:t('ลงปุ๊บ: ย้ายไปสนามที่เรากำลังแพ้ แล้ว +2','On Reveal: Move to a location where you are losing, then get +2.'),
  reveal:(E,c)=>{ E.moveToLosing(c); E.buff(c,2); },
  lore:t('เจ้าหลวงเมืองแพร่องค์สุดท้าย หลังเหตุการณ์กบฏเงี้ยวเมืองแพร่ พ.ศ. 2445 ได้ลี้ภัยไปอยู่หลวงพระบาง','The last ruler of Phrae. After the 1902 Shan rebellion in Phrae he went into exile in Luang Prabang.')});

/* ---------- spirits (ภูติผี): strong, but rituals and the Mom can drive them out ---------- */
card({id:'pusaeyasae',prov:['cm'],type:'ghost',cost:6,power:9,name:t('ปู่แสะย่าแสะ','Pu Sae Ya Sae'),
  text:t('ต่อเนื่อง: การ์ด ชม. อื่นของเราในสนามนี้ +1','Ongoing: Your other Chiang Mai cards here have +1.'),
  aura:(E,s,x)=>x!==s&&x.owner===s.owner&&x.loc===s.loc&&has(x,'cm')?1:0,
  lore:t('ผีบรรพบุรุษผู้พิทักษ์เมืองเชียงใหม่ ตำนานเล่าว่าเป็นยักษ์ที่ยอมรับศีล ทุกปีมีพิธีเลี้ยงดงที่เชิงดอยคำ','Guardian ancestor spirits of Chiang Mai. Legend says they were giants who accepted the precepts; the Liang Dong offering is held at the foot of Doi Kham every year.')});
card({id:'suaemuang',prov:['cm'],type:'ghost',cost:3,power:3,name:t('ผีเสื้อเมือง','City Guardian Spirit'),
  text:t('จบเทิร์น: ล้างสถานะผิดปกติให้การ์ดเราทุกใบในสนามนี้','End of Turn: Clear bad statuses from your cards here.'),
  endTurn:(E,c)=>{ for(const a of E.allies(c,{here:true})) E.cleanse(a); },
  lore:t('ผีอารักษ์ผู้คุ้มครองบ้านเมือง ในเชียงใหม่ผูกพันกับเสาอินทขีลกลางเมือง','The guardian spirit of a city; in Chiang Mai it is tied to the Inthakhin city pillar.')});
card({id:'suaeban',prov:['ln'],type:'ghost',cost:2,power:2,name:t('ผีเสื้อบ้าน','Village Guardian Spirit'),
  text:t('ต่อเนื่อง: การ์ดเราที่อยู่ในสนามบ้านของตัวเอง (จังหวัดตรงกัน) ที่นี่ +1','Ongoing: Your cards here that are on home ground get +1.'),
  aura:(E,s,x)=>x.owner===s.owner&&x.loc===s.loc&&x!==s&&E.homeHere(x)?1:0,
  lore:t('ผีอารักษ์ประจำหมู่บ้าน มีหอผีให้ชาวบ้านบอกกล่าวเมื่อมีงานหรือมีคนมาอยู่ใหม่','A village guardian spirit with its own shrine, told about new arrivals and celebrations.')});
card({id:'puya',prov:['ln'],type:'ghost',cost:3,power:3,name:t('ผีปู่ย่า','Ancestor Spirits'),
  text:t('ลงปุ๊บ: หยิบการ์ดราคา 1–2 จากเด็คขึ้นมือ 1 ใบ','On Reveal: Draw a 1–2 cost card from your deck.'),
  reveal:(E,c)=>E.drawWhere(c.owner,x=>x.def.cost<=2),
  lore:t('ผีบรรพบุรุษของตระกูล สืบทางฝ่ายหญิง ลูกหลานเลี้ยงผีเพื่อขอให้คุ้มครองครอบครัว','Ancestral spirits of a family line, passed down through the women; descendants make offerings for protection.')});
card({id:'phika',prov:['ln'],type:'ghost',cost:2,power:2,name:t('ผีกะ','Phi Ka'),
  text:t('ลงปุ๊บ: สิงการ์ดศัตรู 1 ใบในสนามนี้ ให้ "มึนงง"','On Reveal: Possess an enemy card here, making it Confused.'),
  reveal:(E,c)=>E.status(E.pickEnemy(c,{here:true}),'confuse'),
  lore:t('ผีในความเชื่อพื้นบ้านภาคเหนือ เล่ากันว่าเข้าสิงผู้คนได้','A spirit from northern folk belief, said to possess people.')});
card({id:'phipong',prov:['ln'],type:'ghost',cost:1,power:1,hidden:true,name:t('ผีโป่ง','Salt-Lick Spirit'),
  text:t('ศัตรูเล็งการ์ดนี้ไม่ได้ · จบเทิร์น: +1 (สูงสุด +2)','Enemies can\'t target this. End of Turn: +1 (up to +2).'),
  endTurn:(E,c)=>{ if(c.perm<2) E.buff(c,1); },
  lore:t('ผีป่าที่อยู่ตามโป่ง ดินเค็มที่สัตว์ป่ามาเลีย เชื่อกันว่าซ่อนตัวเก่งมาก','A forest spirit of the salt licks where wild animals come to feed, said to be a master of hiding.')});
card({id:'khunnam',prov:['nn'],type:'ghost',cost:3,power:3,name:t('ผีขุนน้ำ','Headwater Spirit'),
  text:t('ต่อเนื่อง: การ์ดสัตว์และการ์ด นน. อื่นของเราในสนามนี้ +1','Ongoing: Your other Animals and Nan cards here have +1.'),
  aura:(E,s,x)=>x!==s&&x.owner===s.owner&&x.loc===s.loc&&(x.def.type==='animal'||has(x,'nn'))?1:0,
  lore:t('ผีผู้รักษาต้นน้ำ ชุมชนบนดอยทำพิธีเลี้ยงผีขุนน้ำเพื่อขอให้น้ำอุดมตลอดปี','The spirit who guards the headwaters; hill communities make offerings so the water keeps flowing.')});
card({id:'motmeng',prov:['lu'],type:'ghost',cost:4,power:4,name:t('ผีมดผีเม็ง','Phi Mot Phi Meng'),
  text:t('ลงปุ๊บ: การ์ด ลพ. อื่นของเราในสนามนี้ +1 และศัตรู 1 ใบที่นี่ "มึน"','On Reveal: Your other Lamphun cards here get +1 and one enemy here is Stunned.'),
  reveal:(E,c)=>{ for(const a of E.allies(c,{here:true,other:true})) if(has(a,'lu')) E.buff(a,1); E.status(E.pickEnemy(c,{here:true}),'stun'); },
  lore:t('ผีบรรพบุรุษของตระกูลเชื้อสายมอญ มีการฟ้อนผีมดผีเม็งในพิธีเลี้ยงผีประจำปี','Ancestral spirits of families of Mon descent, honoured with the Phi Mot Phi Meng dance each year.')});

/* ---------- rituals (พิธีกรรม): blessings, then the card is offered up and vanishes ---------- */
card({id:'suebchata',prov:['ln'],type:'ritual',cost:2,power:0,name:t('สืบชะตา','Suep Chata Ceremony'),
  text:t('ลงปุ๊บ: ล้างสถานะผิดปกติและ +1 ให้การ์ดเราทุกใบในสนามนี้ แล้วการ์ดนี้หายไป','On Reveal: Clear bad statuses from your cards here and give them +1. Then this vanishes.'),
  reveal:(E,c)=>{ for(const a of E.allies(c,{here:true,other:true})){ E.cleanse(a); E.buff(a,1); } E.remove(c); },
  lore:t('พิธีสืบชะตาของล้านนา ทำเพื่อต่ออายุและเสริมสิริมงคลให้คน บ้าน หรือทั้งเมือง','The Lanna Suep Chata ceremony renews the life and good fortune of a person, a house or a whole city.')});
card({id:'takbat',prov:['ln'],type:'ritual',cost:1,power:0,name:t('ใส่บาตรยามเช้า','Morning Alms'),
  text:t('ลงปุ๊บ: จั่วการ์ด 2 ใบ แล้วการ์ดนี้หายไป','On Reveal: Draw 2 cards. Then this vanishes.'),
  reveal:(E,c)=>{ E.draw(c.owner,2); E.remove(c); },
  lore:t('การใส่บาตรยามเช้า การทำบุญที่คนเหนือทำกันเป็นกิจวัตร','Giving morning alms is an everyday way of making merit in the north.')});
card({id:'songnam',prov:['ln'],type:'ritual',cost:3,power:0,name:t('สรงน้ำพระธาตุ','Bathing the Relic Stupa'),
  text:t('ลงปุ๊บ: ถ้าช่องวัดมีวัด การ์ดจังหวัดนั้นของเราทุกสนาม +1 ถ้าไม่มี จั่ว 1 ใบ แล้วการ์ดนี้หายไป','On Reveal: If a temple is in the slot, your cards of its province everywhere get +1; otherwise draw 1. Then this vanishes.'),
  reveal:(E,c)=>{ const p=E.templeProv(); if(p){ for(const a of E.allies(c,{other:true})) if(has(a,p)) E.buff(a,1); } else E.draw(c.owner,1); E.remove(c); },
  lore:t('ประเพณีสรงน้ำองค์พระธาตุประจำปี เช่นที่พระธาตุหริภุญชัยและพระธาตุลำปางหลวง','The yearly bathing of a relic stupa, held at places such as Wat Phra That Hariphunchai and Lampang Luang.')});
card({id:'thantung',prov:['ln'],type:'ritual',cost:2,power:0,name:t('ทานตุง','Offering of Tung Flags'),
  text:t('ลงปุ๊บ: การ์ดเราทุกใบในสนามนี้ได้ "ป้องกัน" แล้วการ์ดนี้หายไป','On Reveal: Shield all your cards here. Then this vanishes.'),
  reveal:(E,c)=>{ for(const a of E.allies(c,{here:true,other:true})) E.shield(a); E.remove(c); },
  lore:t('การถวายตุง ธงผ้าทอแบบล้านนา เพื่อเป็นพุทธบูชาและอุทิศส่วนกุศล','Offering a tung, the woven Lanna flag, as an act of devotion and to dedicate merit.')});
card({id:'songkhro',prov:['ln'],type:'ritual',cost:2,power:0,name:t('ส่งเคราะห์','Sending Away Misfortune'),
  text:t('ลงปุ๊บ: ไล่การ์ดภูติผีของศัตรู 1 ใบในสนามนี้ออกไป ถ้าไม่มี ศัตรูที่แรงที่สุดที่นี่ "มึน" แล้วการ์ดนี้หายไป','On Reveal: Banish an enemy Spirit here. If there is none, Stun the strongest enemy here. Then this vanishes.'),
  reveal:(E,c)=>{ const g=E.enemies(c,{here:true}).filter(isGhost).sort((a,b)=>E.power(b)-E.power(a))[0]; if(g) E.remove(g); else E.status(E.strongestEnemy(c),'stun'); E.remove(c); },
  lore:t('พิธีส่งเคราะห์ของล้านนา ทำเพื่อขับไล่เคราะห์ร้ายออกไปจากตัวและบ้านเรือน','A Lanna rite that sends misfortune away from a person and their home.')});

/* ---------- myths (สัตว์ในตำนาน) ---------- */
card({id:'naga',prov:['nn'],type:'myth',cost:5,power:7,name:t('พญานาค','Naga'),
  text:t('ต่อเนื่อง: การ์ดสัตว์และสัตว์ในตำนานอื่นของเราในสนามนี้ +1','Ongoing: Your other Animals and Myths here have +1.'),
  aura:(E,s,x)=>x!==s&&x.owner===s.owner&&x.loc===s.loc&&(x.def.type==='animal'||x.def.type==='myth')?1:0,
  lore:t('สัตว์ในตำนานผู้เฝ้าน้ำ เป็นราวบันไดนาคตามวัดทั่วล้านนา และเป็นหัวเรือแข่งของเมืองน่าน','The mythical serpent of the waters, seen on temple stair rails across Lanna and on the prows of Nan\'s racing boats.')});
card({id:'singha',prov:['ln'],type:'myth',cost:3,power:3,name:t('สิงห์ล้านนา','Lanna Lion'),
  text:t('ต่อเนื่อง: +2 ถ้าช่องวัดมีวัด','Ongoing: +2 while a temple is in the slot.'),
  aura:(E,s,x)=>x===s&&E.templeProv()?2:0,
  lore:t('สิงห์คู่เฝ้าประตูวัดและบันไดวิหารตามศิลปะล้านนา','Lion guardians that stand in pairs at Lanna temple gates and stairs.')});
card({id:'erawan',prov:['ln'],type:'myth',cost:6,power:8,name:t('ช้างเอราวัณ','Erawan'),
  text:t('ลงปุ๊บ: การ์ดเราที่แรงที่สุดในแต่ละสนามอื่น +1','On Reveal: Your strongest card at each other location gets +1.'),
  reveal:(E,c)=>{ for(const li of [0,1,2]) if(li!==c.loc){ const a=E.allies(c).filter(x=>x.loc===li).sort((x,y)=>E.power(y)-E.power(x))[0]; if(a) E.buff(a,1); } },
  lore:t('ช้างสามเศียรพาหนะของพระอินทร์ ปรากฏในงานศิลปะทั่วล้านนา','The three-headed elephant who carries Indra, found in art all over Lanna.')});
card({id:'hong',prov:['lu'],type:'myth',cost:2,power:2,name:t('หงส์','Hamsa'),
  text:t('จบเทิร์น (ครั้งเดียว): บินไปสนามที่เรากำลังแพ้ แล้ว +1','End of Turn (once): Fly to a location where you are losing and get +1.'),
  endTurn:(E,c)=>{ if(c.flew) return; const from=c.loc; E.moveToLosing(c); if(c.loc!==from){ c.flew=true; E.buff(c,1); } },
  lore:t('นกในตำนานที่ประดับบนยอดเสาหงส์ตามวัดในลำพูนและชุมชนชาวมอญ','The mythical swan atop the hamsa poles of temples in Lamphun and Mon communities.')});
card({id:'kinnaree',prov:['ln'],type:'myth',cost:2,power:2,name:t('กินนรี','Kinnaree'),
  text:t('ลงปุ๊บ: การ์ดเราที่แรงที่สุดในสนามอื่น +2','On Reveal: Your strongest card elsewhere gets +2.'),
  reveal:(E,c)=>E.buff(E.pickAlly(c,{elsewhere:true}),2),
  lore:t('สัตว์หิมพานต์ครึ่งคนครึ่งนก ขึ้นชื่อเรื่องการร่ายรำงดงาม','A half-woman, half-bird of the Himavanta forest, famed for her graceful dance.')});
card({id:'mom',prov:['ln'],type:'myth',cost:4,power:4,name:t('มอม','Mom'),
  text:t('ต่อเนื่อง: การ์ดภูติผีของศัตรูในสนามนี้ -2','Ongoing: Enemy Spirits here have -2.'),
  aura:(E,s,x)=>x.owner!==s.owner&&x.loc===s.loc&&isGhost(x)?-2:0,
  lore:t('สัตว์ในจินตนาการแบบล้านนา ปั้นประดับวัดเพื่อปกปักรักษา','A Lanna imaginary guardian beast, sculpted on temples to keep watch.')});

/* ---------- festivals (เทศกาล) ---------- */
card({id:'yipeng',prov:['cm'],type:'fest',cost:4,power:2,name:t('ยี่เป็ง','Yi Peng'),
  text:t('ลงปุ๊บ: การ์ดเราทุกใบทุกสนาม +1 (โคมลอยเต็มฟ้า)','On Reveal: All your cards everywhere get +1 (lanterns fill the sky).'),
  reveal:(E,c)=>{ for(const a of E.allies(c,{other:true})) E.buff(a,1); },
  lore:t('ประเพณีวันเพ็ญเดือนยี่ตามปฏิทินล้านนา ราวเดือนพฤศจิกายน จุดผางประทีปและปล่อยโคม','The full moon of the second Lanna month, around November, when lamps are lit and lanterns released.')});
card({id:'poysanglong',prov:['ms'],type:'fest',cost:3,power:3,name:t('ปอยส่างลอง','Poy Sang Long'),
  text:t('ลงปุ๊บ: การ์ด มส. ของเราทุกสนาม +1','On Reveal: Your Mae Hong Son cards everywhere get +1.'),
  reveal:(E,c)=>{ for(const a of E.allies(c,{other:true})) if(has(a,'ms')) E.buff(a,1); },
  lore:t('งานบวชเณรของชาวไทใหญ่ในแม่ฮ่องสอน เด็กชายแต่งกายงดงามแบบเจ้าชายและแห่รอบเมืองก่อนบวช','The Shan novice ordination festival of Mae Hong Son, when boys are dressed as princes and paraded before ordination.')});
card({id:'boatrace',prov:['nn'],type:'fest',cost:2,power:2,name:t('แข่งเรือเมืองน่าน','Nan Boat Race'),
  text:t('ลงปุ๊บ: ดึงการ์ดเราที่แรงที่สุดจากสนามอื่นมาที่นี่ แล้ว +1','On Reveal: Pull your strongest card from elsewhere to here and give it +1.'),
  reveal:(E,c)=>{ const a=E.pickAlly(c,{elsewhere:true}); if(a&&E.move(a,c.loc)) E.buff(a,1); },
  lore:t('การแข่งเรือยาวเมืองน่าน หัวเรือแกะเป็นรูปพญานาค จัดช่วงออกพรรษา','Nan\'s long-boat races, with naga-carved prows, held around the end of Buddhist Lent.')});
card({id:'salak',prov:['lu'],type:'fest',cost:2,power:1,name:t('ตานก๋วยสลาก','Tan Kuay Salak'),
  text:t('ลงปุ๊บ: จั่ว 1 ใบ และการ์ด ลพ. อื่นของเราในสนามนี้ +1','On Reveal: Draw 1. Your other Lamphun cards here get +1.'),
  reveal:(E,c)=>{ E.draw(c.owner,1); for(const a of E.allies(c,{here:true,other:true})) if(has(a,'lu')) E.buff(a,1); },
  lore:t('ประเพณีถวายสลากภัตของล้านนา จัดใหญ่ที่ลำพูนและหลายจังหวัดภาคเหนือ','The Lanna Salak offering festival, held on a grand scale in Lamphun and across the north.')});
card({id:'pimai',prov:['ln'],type:'fest',cost:3,power:3,name:t('ปีใหม่เมือง','Lanna New Year'),
  text:t('ลงปุ๊บ: ล้างสถานะผิดปกติของทุกใบในสนามนี้ (ทั้งสองฝ่าย) และการ์ดเราที่นี่ +1','On Reveal: Clear bad statuses from every card here (both sides). Your cards here get +1.'),
  reveal:(E,c)=>{ for(const e of E.enemies(c,{here:true})) E.cleanse(e); for(const a of E.allies(c,{here:true,other:true})){ E.cleanse(a); E.buff(a,1); } },
  lore:t('สงกรานต์แบบล้านนา 13–16 เมษายน รดน้ำดำหัวผู้ใหญ่และสาดน้ำคลายร้อน','The Lanna Songkran, 13–16 April, with respectful water-pouring for elders and water fights in the heat.')});

/* ---------- crafts & music (ของดี) ---------- */
card({id:'lacquer',prov:['cm'],type:'item',cost:1,power:1,name:t('เครื่องเขิน','Khoen Lacquerware'),
  text:t('ต่อเนื่อง: การ์ดของกินของเราในสนามนี้ +1','Ongoing: Your Food here has +1.'),
  aura:(E,s,x)=>x.owner===s.owner&&x.loc===s.loc&&x.def.type==='food'?1:0,
  lore:t('ภาชนะลงรักวาดลายของชาวไทเขิน ย่านวัดนันทารามในเชียงใหม่','Lacquered vessels of the Tai Khoen people, made around Wat Nantaram in Chiang Mai.')});
card({id:'namlai',prov:['nn'],type:'item',cost:2,power:2,name:t('ผ้าลายน้ำไหล','Nam Lai Weave'),
  text:t('ลงปุ๊บ: การ์ดเราอีก 1 ใบในสนามนี้ได้ "ป้องกัน" ถ้าเป็นการ์ด นน. ได้ +1 ด้วย','On Reveal: Shield another of your cards here. If it is a Nan card, it also gets +1.'),
  reveal:(E,c)=>{ const a=E.pickAlly(c,{here:true}); if(a){ E.shield(a); if(has(a,'nn')) E.buff(a,1); } },
  lore:t('ผ้าทอของชาวไทลื้อเมืองน่าน ลวดลายคล้ายสายน้ำไหล','A Tai Lue weave from Nan whose pattern looks like flowing water.')});
card({id:'sueng',prov:['ln'],type:'item',cost:2,power:3,name:t('ซึง','Sueng Lute'),
  text:t('ต่อเนื่อง: การ์ดเทศกาลของเราในสนามนี้ +2','Ongoing: Your Festivals here have +2.'),
  aura:(E,s,x)=>x.owner===s.owner&&x.loc===s.loc&&x.def.type==='fest'?2:0,
  lore:t('เครื่องดนตรีดีดพื้นเมืองล้านนา บรรเลงในงานรื่นเริง','A plucked Lanna lute played at celebrations.')});
card({id:'salaw',prov:['ln'],type:'item',cost:1,power:1,name:t('สะล้อ','Salaw Fiddle'),
  text:t('ลงปุ๊บ: การ์ดเราอีก 1 ใบในสนามนี้ +1','On Reveal: Another of your cards here gets +1.'),
  reveal:(E,c)=>E.buff(E.pickAlly(c,{here:true}),1),
  lore:t('เครื่องสีพื้นเมืองภาคเหนือ มักเล่นคู่กับซึง','A northern bowed fiddle, usually played with the sueng.')});
card({id:'klongsabatchai',prov:['ln'],type:'item',cost:3,power:3,name:t('กลองสะบัดชัย','Sabat Chai Drum'),
  text:t('ลงปุ๊บ: ศัตรูที่แรงที่สุดในสนามนี้ "มึน"','On Reveal: Stun the strongest enemy here.'),
  reveal:(E,c)=>E.status(E.strongestEnemy(c),'stun'),
  lore:t('กลองใหญ่ของล้านนา แต่เดิมตีปลุกขวัญนักรบ ปัจจุบันตีในงานประเพณี','The great Lanna drum, once beaten to rouse warriors and now played at festivals.')});
card({id:'khomlanna',prov:['ln'],type:'item',cost:2,power:1,name:t('โคมล้านนา','Lanna Lantern'),
  text:t('ลงปุ๊บ: +1 ต่อการ์ดภูติผีทุกใบบนกระดาน (แสงโคมไล่ความมืด)','On Reveal: +1 for each Spirit on the board (light drives out the dark).'),
  reveal:(E,c)=>{ const n=E.all().filter(isGhost).length; if(n) E.buff(c,n); },
  lore:t('โคมกระดาษแบบล้านนา แขวนประดับวัดและบ้านเรือนในงานยี่เป็ง','Lanna paper lanterns hung at temples and homes during Yi Peng.')});

/* ---------- more food ---------- */
card({id:'kaengho',prov:['ln'],type:'food',cost:3,power:3,name:t('แกงโฮะ','Kaeng Ho'),
  text:t('ลงปุ๊บ: การ์ดเราอื่นในสนามนี้ +1 สูงสุด 3 ใบ','On Reveal: Up to 3 of your other cards here get +1.'),
  reveal:(E,c)=>{ for(const a of E.allies(c,{here:true,other:true}).slice(0,3)) E.buff(a,1); },
  lore:t('นำแกงที่เหลือจากงานบุญมาผัดรวมกับวุ้นเส้นและหน่อไม้ดอง','Leftover curries from a merit-making feast, stir-fried with glass noodles and pickled bamboo.')});
card({id:'namphrikong',prov:['ln'],type:'food',cost:1,power:1,name:t('น้ำพริกอ่อง','Nam Phrik Ong'),
  text:t('ลงปุ๊บ: การ์ดเราอีก 1 ใบในสนามนี้ +1','On Reveal: Another of your cards here gets +1.'),
  reveal:(E,c)=>E.buff(E.pickAlly(c,{here:true}),1),
  lore:t('น้ำพริกหมูสับกับมะเขือเทศ กินกับผักสดและแคบหมู','A minced pork and tomato chilli dip, eaten with fresh vegetables and pork crackling.')});
card({id:'jinsom',prov:['ln'],type:'food',cost:2,power:2,name:t('จิ้นส้ม','Jin Som'),
  text:t('จบเทิร์น: +1 (สูงสุด +2) ยิ่งหมักยิ่งเปรี้ยว','End of Turn: +1 (up to +2). The longer it ferments, the better.'),
  endTurn:(E,c)=>{ if(c.perm<2) E.buff(c,1); },
  lore:t('เนื้อหมูหมักห่อใบตองแบบเหนือ ยิ่งหมักนานยิ่งเปรี้ยว','Northern fermented pork wrapped in banana leaf, sourer the longer it sits.')});
card({id:'khaokanjin',prov:['ln'],type:'food',cost:2,power:1,name:t('ข้าวกั๊นจิ๊น','Khao Kan Jin'),
  text:t('ลงปุ๊บ: การ์ดเราที่แรงที่สุดในสนามนี้ +2','On Reveal: Your strongest other card here gets +2.'),
  reveal:(E,c)=>E.buff(E.pickAlly(c,{here:true}),2),
  lore:t('ข้าวคลุกเลือดหมูนึ่งในใบตอง โรยกระเทียมเจียว','Rice mixed with pork blood, steamed in banana leaf and topped with fried garlic.')});
card({id:'khaipam',prov:['ln'],type:'food',cost:1,power:2,name:t('ไข่ป่าม','Khai Pam'),
  text:t('อร่อยง่ายๆ ไม่มีความสามารถ','Simple and tasty. No ability.'),
  lore:t('ไข่ทอดในกระทงใบตองบนเตาถ่าน','Egg cooked in a banana-leaf cup over charcoal.')});
card({id:'kaengkhae',prov:['ln'],type:'food',cost:2,power:2,name:t('แกงแค','Kaeng Khae'),
  text:t('ลงปุ๊บ: ล้างสถานะผิดปกติให้การ์ดเรา 1 ใบในสนามนี้ แล้ว +1','On Reveal: Clear bad statuses from one of your cards here and give it +1.'),
  reveal:(E,c)=>{ const a=E.pickAlly(c,{here:true}); if(a){ E.cleanse(a); E.buff(a,1); } },
  lore:t('แกงผักรวมใส่ดอกแคและพริกลาบ อาหารบ้านๆ ของคนเหนือ','A mixed-vegetable curry with sesbania flowers and larb spice, a northern home dish.')});
card({id:'miang',prov:['ln'],type:'food',cost:1,power:0,name:t('เมี่ยง','Miang'),
  text:t('ลงปุ๊บ: จั่ว 1 ใบ แล้วการ์ดนี้หายไป','On Reveal: Draw 1. Then this vanishes.'),
  reveal:(E,c)=>{ E.draw(c.owner,1); E.remove(c); },
  lore:t('ใบชาหมักของคนเหนือ เคี้ยวยามว่างหรือใช้รับแขก','Fermented tea leaves of the north, chewed to relax or offered to guests.')});

/* ---------- new battlefields ---------- */
LOCS.push(
  {id:'chiangdao',prov:'cm',name:t('ดอยหลวงเชียงดาว','Doi Luang Chiang Dao'),text:t('ที่สถิตเจ้าหลวงคำแดง: การ์ดภูติผีที่นี่ +2','Home of Chao Luang Kham Daeng: Spirits here have +2.'),aura:(E,l,c)=>isGhost(c)?2:0,
   lore:t('ภูเขาหินปูนสูงอันดับต้นของไทย ตำนานเล่าว่าเป็นที่สถิตของเจ้าหลวงคำแดง ผู้เป็นใหญ่เหนือผีทั้งหลาย','One of Thailand\'s highest limestone peaks; legend says it is home to Chao Luang Kham Daeng, lord of the spirits.'),maps:'ดอยหลวงเชียงดาว'},
  {id:'pai',prov:'ms',name:t('ปาย','Pai'),text:t('เมืองชิลล์: การ์ดราคา 1 ที่นี่ +2','Chill town: 1-cost cards here have +2.'),aura:(E,l,c)=>E.cost(c)===1?2:0,
   lore:t('อำเภอเล็กในแม่ฮ่องสอน ขึ้นชื่อเรื่องบรรยากาศสบายๆ และทะเลหมอก','A small district of Mae Hong Son known for its easy-going vibe and misty mornings.'),maps:'อำเภอปาย'},
  {id:'thaphae',prov:'cm',name:t('ถนนคนเดินท่าแพ','Tha Phae Walking Street'),text:t('ตลาดนัดวันอาทิตย์: ของดีและของกินที่นี่ +1','Sunday market: Treasures and Food here have +1.'),aura:(E,l,c)=>c.def.type==='item'||c.def.type==='food'?1:0,
   lore:t('ถนนคนเดินวันอาทิตย์จากประตูท่าแพ เชียงใหม่ มีงานหัตถกรรมและของกินมากมาย','The Sunday walking street from Tha Phae Gate in Chiang Mai, full of crafts and food.'),maps:'ถนนคนเดินท่าแพ'},
  {id:'bokluea',prov:'nn',name:t('บ่อเกลือ','Bo Kluea Salt Wells'),text:t('เกลือรักษา: จบเทิร์น การ์ดที่อ่อนที่สุดของแต่ละฝ่ายที่นี่ +1','Salt preserves: At end of turn, each side\'s weakest card here gets +1.'),
   endTurn:(E,l,li)=>{ for(const side of [0,1]){ const w=E.at(li,side).sort((a,b)=>E.power(a)-E.power(b))[0]; if(w) E.buff(w,1); } },
   lore:t('อ.บ่อเกลือ จังหวัดน่าน มีบ่อเกลือสินเธาว์ที่ชาวบ้านยังต้มเกลือแบบโบราณ','Bo Kluea in Nan has mountain salt wells where villagers still boil salt the traditional way.'),maps:'บ่อเกลือ น่าน'},
  {id:'phulangka',prov:'py',name:t('ภูลังกา','Phu Langka'),text:t('ตะวันขึ้นช้า: การ์ดที่ลงเทิร์น 5–6 ที่นี่ +2','Late sunrise: Cards played here on turns 5–6 get +2.'),onPlay:(E,l,c)=>{ if(E.turn>=5) E.buff(c,2); },
   lore:t('อุทยานแห่งชาติในพะเยา จุดชมทะเลหมอกและพระอาทิตย์ขึ้น','A national park in Phayao, loved for its sea of mist and sunrises.'),maps:'อุทยานแห่งชาติภูลังกา'},
  {id:'chaeson',prov:'lp',name:t('น้ำพุร้อนแจ้ซ้อน','Chae Son Hot Springs'),text:t('น้ำพุร้อน: จบเทิร์น ล้างสถานะผิดปกติของทุกใบที่นี่','Hot springs: At end of turn, clear bad statuses from every card here.'),
   endTurn:(E,l,li)=>{ for(const side of [0,1]) for(const x of E.at(li,side)) E.cleanse(x); },
   lore:t('อุทยานแห่งชาติในลำปาง มีบ่อน้ำพุร้อนธรรมชาติกลางป่า','A national park in Lampang with natural hot springs in the forest.'),maps:'อุทยานแห่งชาติแจ้ซ้อน'}
);

/* rebuild lookups with set 2 */
for(const c of C) CARDS[c.id]=c; for(const l of LOCS) LOCMAP[l.id]=l;
