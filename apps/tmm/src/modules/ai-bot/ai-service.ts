export interface ParsedCommand {
  intent: 
    | 'CREATE_FAULT' 
    | 'UPDATE_FAULT'
    | 'COMPLETE_DAILY_ROUTINES'
    | 'ADD_METER_READING' 
    | 'AUTOFILL_SUNDAYS'
    | 'CREATE_METER'
    | 'UPDATE_APARTMENT' 
    | 'CREATE_AREA'
    | 'CREATE_EQUIPMENT'
    | 'UPDATE_PERSONNEL'
    | 'CREATE_COMPANY'
    | 'QUERY_INFO'
    | 'COMPLETE_FAULTS_REPORT' 
    | 'GENERIC_ACTION'
    | 'UNKNOWN';
  summary: string;
  data: Record<string, any>;
}

export class AIService {
  private static getApiKey(provider: 'gemini' | 'openai' = 'gemini'): string {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem(`ai_api_key_${provider}`);
      if (savedKey) return savedKey;
    }
    return process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
  }

  /**
   * Universal Natural Language Command & Query Parser using Google Gemini API / Fallback NLP
   */
  public static async parseCommand(text: string): Promise<ParsedCommand> {
    const trimmed = text.trim();
    if (!trimmed) {
      return {
        intent: 'UNKNOWN',
        summary: 'Geçersiz veya boş komut.',
        data: {}
      };
    }

    // 1. Direct Pattern Matcher (Instant execution for routines, meters, autofill and status commands)
    const directParsed = this.fallbackParse(trimmed);
    if (directParsed.intent !== 'UNKNOWN' && directParsed.intent !== 'CREATE_FAULT') {
      return directParsed;
    }

    const apiKey = this.getApiKey('gemini');

    // If Gemini API Key is available, use Google Gemini AI Free Tier API for Universal Parsing
    if (apiKey) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Sen TerraceFeri Konutları Akıllı Yönetim Sisteminin (TMM) Evrensel Yapay Zeka Asistanısın. 
Kullanıcının Türkçe sesli veya yazılı HER TÜRLÜ isteğini analiz et ve SADECE saf bir JSON objesi döndür.

Sistemde Yapılabilecek Tüm İşlemler (Intents):
1. COMPLETE_DAILY_ROUTINES: Günlük rutin işlerin veya devriyelerin durumunu 'Tamamlandı' (Tamam), 'Bekliyor' veya 'İşlemde' olarak güncelleme. (Örn: "günlük rutin işleri tamam yap", "rutinleri bekliyor yap", "rutinler tamam"). ASLA YENİ ARIZA AÇMA, MEVCUT OLANLARIN BUTONUNA BASILMIŞ GİBİ DURUMUNU DÜZENLE. Data: {"targetStatus": "Tamamlandı" | "Bekliyor" | "İşlemde", "targetDate": "YYYY-MM-DD"}
2. UPDATE_FAULT: Var olan arızaların durumunu güncelleme veya kapatma (Örn: "asansör arızası tamamlandı", "tüm arızaları bekliyor yap"). ASLA YENİ ARIZA AÇMA. Data: {"status": "Tamamlandı" | "Bekliyor" | "İşlemde", "query": ""}
3. CREATE_FAULT: YALNIZCA yeni bir arıza bildirildiğinde yeni arıza kaydı açma (Örn: "B blok daire 5'te su sızıntısı var yeni arıza ekle")
4. ADD_METER_READING: Sayaç okuma / endeks girme (Su, Elektrik, Doğalgaz vb.)
5. AUTOFILL_SUNDAYS: Pazar günlerini otomatik doldurma
6. CREATE_METER: Yeni sayaç ekleme
7. UPDATE_APARTMENT: Daire sakini, telefon, plaka veya daire durumunu güncelleme
8. CREATE_AREA: Yeni teknik oda, alan veya alt sistem ekleme
9. CREATE_EQUIPMENT: Yeni demirbaş cihaz/ekipman ekleme
10. UPDATE_PERSONNEL: Personel bilgisi, vardiya veya çalışma saati güncelleme
11. CREATE_COMPANY: Yeni servis/onarım firması ekleme
12. QUERY_INFO: Sistemden bilgi sorgulama (Örn: "Kaç açık arıza var?", "Daire 3'te kim oturuyor?", "Bugün okunan sayaçlar")
13. COMPLETE_FAULTS_REPORT: Rapor hazırlama veya gönderme

JSON Formatı:
{
  "intent": "COMPLETE_DAILY_ROUTINES" | "UPDATE_FAULT" | "CREATE_FAULT" | "ADD_METER_READING" | "AUTOFILL_SUNDAYS" | "CREATE_METER" | "UPDATE_APARTMENT" | "CREATE_AREA" | "CREATE_EQUIPMENT" | "UPDATE_PERSONNEL" | "CREATE_COMPANY" | "QUERY_INFO" | "COMPLETE_FAULTS_REPORT" | "GENERIC_ACTION" | "UNKNOWN",
  "summary": "Yapılacak işlemin anlaşılır Türkçe özeti",
  "data": {
    // İlgili niyet için çıkarılan değişkenler
  }
}

Kullanıcı Girdisi: "${trimmed}"`
              }]
            }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.1
            }
          })
        });

        if (response.ok) {
          const resData = await response.json();
          const jsonText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (jsonText) {
            const parsed = JSON.parse(jsonText);
            return parsed;
          }
        }
      } catch (err) {
        console.warn('Gemini AI parsing failed, falling back to local NLP parser:', err);
      }
    }

    // Fallback Local NLP Pattern Parser (Works offline without API key for any prompt)
    return this.fallbackParse(trimmed);
  }

  /**
   * Fallback rule-based NLP parser for offline & instant execution
   */
  private static fallbackParse(text: string): ParsedCommand {
    const lower = text.toLowerCase();

    const isStatusWord = lower.includes('tamam') || lower.includes('bekliyor') || lower.includes('beklemede') || 
                         lower.includes('işlem') || lower.includes('islem') || lower.includes('sıfırla') || 
                         lower.includes('sifirla') || lower.includes('kapat') || lower.includes('bitir') || lower.includes('yap');

    const getStatus = (t: string): 'Bekliyor' | 'İşlemde' | 'Tamamlandı' => {
      const l = t.toLowerCase();
      if (l.includes('bekliyor yap') || l.includes('beklemede yap') || l.includes('beklet') || l.includes('sıfırla') || l.includes('sifirla') || l.includes('beklemeye al') || l.endsWith('bekliyor') || l.endsWith('beklemede')) {
        return 'Bekliyor';
      }
      if (l.includes('işlemde yap') || l.includes('islemde yap') || l.includes('işleme al') || l.includes('isleme al') || l.includes('devam et') || l.endsWith('işlemde') || l.endsWith('islemde')) {
        return 'İşlemde';
      }
      if (l.includes('tamam yap') || l.includes('tamamla') || l.includes('tamamlandı yap') || l.includes('tamamlandi yap') || l.includes('tamam et') || l.includes('bitir') || l.includes('kapat') || l.endsWith('tamam') || l.endsWith('tamamlandı')) {
        return 'Tamamlandı';
      }

      const posTamam = Math.max(l.lastIndexOf('tamam'), l.lastIndexOf('bitir'), l.lastIndexOf('kapat'));
      const posBekle = Math.max(l.lastIndexOf('bekle'), l.lastIndexOf('sıfırla'), l.lastIndexOf('sifirla'));
      const posIslem = Math.max(l.lastIndexOf('işlem'), l.lastIndexOf('islem'), l.lastIndexOf('devam'));

      if (posBekle > posTamam && posBekle > posIslem) return 'Bekliyor';
      if (posIslem > posTamam && posIslem > posBekle) return 'İşlemde';
      return 'Tamamlandı';
    };

    // 1. AYLIK RUTİNLER ("aylık rutinleri tamam yap", "aylık rutinler bekliyor")
    const isMonthlyWords = lower.includes('aylık') || lower.includes('aylik');
    if (isMonthlyWords && (lower.includes('rutin') || lower.includes('kontrol') || lower.includes('bakım') || lower.includes('bakim') || lower.includes('iş') || lower.includes('is'))) {
      const targetStatus = getStatus(text);
      const targetDate = this.extractDateFromText(text);
      return {
        intent: 'COMPLETE_DAILY_ROUTINES',
        summary: `${targetDate} tarihli Aylık Rutin görevler veritabanında "${targetStatus}" olarak güncelleniyor.`,
        data: { targetStatus, targetDate, routineType: 'AYLIK_RUTIN' }
      };
    }

    // 2. GÜNLÜK RUTİNLER / GÜNLÜK İŞLER ("bekliyordaki günlük işleri tamam yap", "günlük rutinleri bekliyor yap", "rutinleri tamamla")
    const isDailyWords = lower.includes('günlük') || lower.includes('gunluk') || lower.includes('rutin') || lower.includes('devriye');
    if (isDailyWords && !isMonthlyWords && (isStatusWord || lower.includes('iş') || lower.includes('is') || lower.includes('görev') || lower.includes('gorev') || lower.includes('kontrol') || lower.includes('devriye') || lower.includes('rutin'))) {
      const targetStatus = getStatus(text);
      const targetDate = this.extractDateFromText(text);
      return {
        intent: 'COMPLETE_DAILY_ROUTINES',
        summary: `${targetDate} tarihli Günlük Rutin görevler veritabanında "${targetStatus}" olarak güncelleniyor.`,
        data: { targetStatus, targetDate, routineType: 'GUNLUK_RUTIN' }
      };
    }

    // 3. ARIZALAR DURUM GÜNCELLEME ("arızalar bekliyor", "arızaları tamam yap", "asansör arızası işlemde")
    if (
      (lower.includes('arıza') || lower.includes('ariza')) && 
      isStatusWord && 
      !lower.includes('yeni') && !lower.includes('ekle') && !lower.includes('oluştur') && !lower.includes('aç')
    ) {
      const targetStatus = getStatus(text);
      const isSpecific = lower.includes('asansör') || lower.includes('klima') || lower.includes('kombi') || lower.includes('hidrofor') || lower.includes('intercom') || lower.includes('blok') || lower.includes('daire');
      
      return {
        intent: 'UPDATE_FAULT',
        summary: `Arıza kayıtları veritabanında "${targetStatus}" durumuna getiriliyor.`,
        data: { 
          status: targetStatus,
          query: isSpecific ? text : '',
          isAll: !isSpecific
        }
      };
    }

    // 3. COMPLETE_FAULTS_REPORT ("rapor", "raporu tamamla", "raporu gönder", "pdf")
    if (lower.includes('rapor') || lower.includes('pdf') || lower.includes('hazırla') || lower.includes('hazirla')) {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const fileName = `${day}.${month}.pdf`;

      return {
        intent: 'COMPLETE_FAULTS_REPORT',
        summary: `Günlük Arıza Raporu ${fileName} adıyla günlükrapor klasörüne kaydedildi.`,
        data: { sendWhatsapp: true, fileName }
      };
    }

    // 2. AUTOFILL_SUNDAYS ("pazar", "pazarları", "pazar günlerini doldur/otomatik gir")
    if (lower.includes('pazar') && (lower.includes('doldur') || lower.includes('gir') || lower.includes('otomatik') || lower.includes('hesapla'))) {
      return {
        intent: 'AUTOFILL_SUNDAYS',
        summary: 'Pazar günleri sayaç değerleri önceki tüketim trendine göre otomatik dolduruluyor.',
        data: {}
      };
    }

    // 3. CREATE_FAULT ("arıza", "arızası", "bozuk", "çalışmıyor", "problem", "hasarlı", "sızıntı", "servis çağrıldı")
    if (
      lower.includes('arıza') || lower.includes('ariza') || lower.includes('arızası') || lower.includes('arizasi') ||
      lower.includes('bozuk') || lower.includes('çalışmıyor') || lower.includes('calismiyor') || lower.includes('servis çağrıldı')
    ) {
      const blockMatch = text.match(/([a-eA-E])\s*blok/i);
      const aptMatch = text.match(/daire\s*(\d+)/i) || text.match(/(\d+)\s*nolu/i);

      const block = blockMatch ? blockMatch[1].toUpperCase() : 'B';
      const apartmentNo = aptMatch ? aptMatch[1] : '';

      return {
        intent: 'CREATE_FAULT',
        summary: `Yeni arıza kaydı oluşturuluyor: ${text}`,
        data: {
          block,
          apartmentNo,
          title: text,
          priority: lower.includes('acil') ? 'ACIL' : 'ORTA'
        }
      };
    }

    // 3. Meter Reading (Tekil veya Çoklu Sayaç Girişi + Özel Tarih Desteği)
    if (lower.includes('su') || lower.includes('elektrik') || lower.includes('doğalgaz') || lower.includes('gaz') || lower.includes('sayac') || lower.includes('sayaç') || lower.includes('endeks')) {
      const readDate = this.extractDateFromText(text);

      // Extract numbers associated with meters (ignoring date tokens)
      const cleanTextForMeters = text.replace(/(\b\d{1,2})[./\-](\d{1,2})(?:[./\-](\d{2,4}))?/, '');
      
      const aktifMatch = text.match(/(?:aktif|elektrik|elk)\s*[:=]?\s*(\d+)/i);
      const reaktifMatch = text.match(/reaktif\s*[:=]?\s*(\d+)/i);
      const kapMatch = text.match(/(?:kapasitif|kap)\s*[:=]?\s*(\d+)/i);
      const gasMatch = text.match(/(?:doğalgaz|dogalgaz|gaz)\s*[:=]?\s*(\d+)/i);
      const suDaireMatch = text.match(/(?:su\s*daire|daire\s*su|daireler)\s*[:=]?\s*(\d+)/i);
      const suDukMatch = text.match(/(?:su\s*dükkan|su\s*dukkan|dükkan\s*su|dukkan\s*su|dükkan|dukkan|dükkanlar)\s*[:=]?\s*(\d+)/i);

      const hasMulti = !!(aktifMatch || gasMatch || suDaireMatch || suDukMatch);

      if (hasMulti) {
        const summaryParts: string[] = [];
        if (aktifMatch) summaryParts.push(`Elektrik: ${aktifMatch[1]}`);
        if (gasMatch) summaryParts.push(`Doğalgaz: ${gasMatch[1]}`);
        if (suDaireMatch) summaryParts.push(`Su Daire: ${suDaireMatch[1]}`);
        if (suDukMatch) summaryParts.push(`Su Dükkan: ${suDukMatch[1]}`);

        return {
          intent: 'ADD_METER_READING',
          summary: `${readDate} tarihli sayaç değerleri kaydediliyor (${summaryParts.join(', ')})`,
          data: {
            readDate,
            aktif: aktifMatch ? parseInt(aktifMatch[1], 10) : undefined,
            reaktif: reaktifMatch ? parseInt(reaktifMatch[1], 10) : undefined,
            kapasitif: kapMatch ? parseInt(kapMatch[1], 10) : undefined,
            gas: gasMatch ? parseInt(gasMatch[1], 10) : undefined,
            suDaire: suDaireMatch ? parseInt(suDaireMatch[1], 10) : undefined,
            suDuk: suDukMatch ? parseInt(suDukMatch[1], 10) : undefined,
          }
        };
      }

      // Single meter fallback
      let type: 'Su' | 'Elektrik' | 'Doğalgaz' = 'Su';
      if (lower.includes('elektrik')) type = 'Elektrik';
      if (lower.includes('doğalgaz') || lower.includes('gaz')) type = 'Doğalgaz';

      const numbers = cleanTextForMeters.match(/\d+/g);
      const val = numbers && numbers.length > 0 ? parseInt(numbers[numbers.length - 1], 10) : 0;
      
      let target = 'Genel';
      if (lower.includes('dükkan') || lower.includes('dukkan')) target = 'Dükkan';
      else if (lower.includes('daire')) {
        const daireMatch = text.match(/daire\s*(\d+)/i);
        target = daireMatch ? `Daire ${daireMatch[1]}` : 'Daire';
      }

      return {
        intent: 'ADD_METER_READING',
        summary: `${readDate} tarihli ${target} ${type} sayacı endeksi (${val}) olarak kaydedildi.`,
        data: { readDate, type, target, value: val, aktif: type === 'Elektrik' ? val : undefined, gas: type === 'Doğalgaz' ? val : undefined, suDaire: type === 'Su' && target.includes('Daire') ? val : undefined, suDuk: type === 'Su' && target.includes('Dükkan') ? val : undefined }
      };
    }

    // 4. Equipment Ekleme
    if (lower.includes('ekipman') || lower.includes('cihaz') || lower.includes('pompa') || lower.includes('jeneratör')) {
      return {
        intent: 'CREATE_EQUIPMENT',
        summary: `Sisteme yeni ekipman/cihaz kaydedildi: ${text}`,
        data: { name: text, type: 'Mekanik' }
      };
    }

    // 5. Alan Ekleme
    if (lower.includes('alan') || lower.includes('oda') || lower.includes('bodrum')) {
      return {
        intent: 'CREATE_AREA',
        summary: `Sisteme yeni alan/oda eklendi: ${text}`,
        data: { name: text }
      };
    }

    // 6. Personel Güncelleme / Vardiya
    if (lower.includes('personel') || lower.includes('vardiya') || lower.includes('çalışan')) {
      return {
        intent: 'UPDATE_PERSONNEL',
        summary: `Personel çalışma/vardiya bilgileri güncellendi: ${text}`,
        data: { text }
      };
    }

    // 7. Bilgi Sorgulama (Query)
    if (lower.includes('kaç') || lower.includes('kim') || lower.includes('nerede') || lower.includes('liste') || lower.includes('göster') || lower.includes('neler')) {
      return {
        intent: 'QUERY_INFO',
        summary: `Bilgi sorgulandı: ${text}`,
        data: { query: text }
      };
    }

    // 8. Apartment Update (Sadece sakin, kiracı, düzenle, telefon, plaka geçtiğinde)
    if (
      (lower.includes('blok') || lower.includes('daire')) && 
      (lower.includes('sakin') || lower.includes('düzenle') || lower.includes('duzenle') || lower.includes('kiracı') || lower.includes('telefon') || lower.includes('plaka'))
    ) {
      const blockMatch = text.match(/([a-eA-E])\s*blok/i);
      const aptMatch = text.match(/daire\s*(\d+)/i) || text.match(/(\d+)\s*nolu/i);
      const phoneMatch = text.match(/(0?5\d{2}\s*\d{3}\s*\d{2}\s*\d{2}|\d{10,11})/);

      const block = blockMatch ? blockMatch[1].toUpperCase() : 'A';
      const apartmentNo = aptMatch ? aptMatch[1] : '1';
      const phone = phoneMatch ? phoneMatch[0] : '';

      return {
        intent: 'UPDATE_APARTMENT',
        summary: `${block} Blok Daire ${apartmentNo} sakini bilgileri güncellendi.`,
        data: { block, apartmentNo, phone }
      };
    }

    // 9. Generic Action Fallback
    return {
      intent: 'GENERIC_ACTION',
      summary: `Komut işleme alındı: "${text}"`,
      data: { commandText: text }
    };
  }

  /**
   * Extract target date from text (e.g. 18.08, 18.08.2026, 18 Ağustos, dün, bugün)
   */
  public static extractDateFromText(text: string): string {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const lower = text.toLowerCase();

    // 1. Check relative words (dün / dun)
    if (lower.includes('dün') || lower.includes('dun')) {
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      return `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    }

    // 2. Check standard dot/slash date pattern (e.g. 18.08, 18.08.2026, 18/08)
    const dotDateMatch = text.match(/(\b\d{1,2})[./\-](\d{1,2})(?:[./\-](\d{2,4}))?/);
    if (dotDateMatch) {
      const d = parseInt(dotDateMatch[1], 10);
      const m = parseInt(dotDateMatch[2], 10);
      let y = dotDateMatch[3] ? parseInt(dotDateMatch[3], 10) : currentYear;
      if (y < 100) y += 2000;
      if (d >= 1 && d <= 31 && m >= 1 && m <= 12) {
        return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      }
    }

    // 3. Check Turkish month names (e.g. 18 ağustos, 18 agustos 2026)
    const months = ['ocak', 'şubat|subat', 'mart', 'nisan', 'mayıs|mayis', 'haziran', 'temmuz', 'ağustos|agustos', 'eylül|eylul', 'ekim', 'kasım|kasim', 'aralık|aralik'];
    for (let i = 0; i < months.length; i++) {
      const regex = new RegExp(`(\\b\\d{1,2})\\s*(?:${months[i]})(?:\\s*(\\d{4}))?`, 'i');
      const match = text.match(regex);
      if (match) {
        const d = parseInt(match[1], 10);
        const m = i + 1;
        const y = match[2] ? parseInt(match[2], 10) : currentYear;
        if (d >= 1 && d <= 31) {
          return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        }
      }
    }

    // Default to today
    return `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }
}
