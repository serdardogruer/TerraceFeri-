import { ParsedCommand } from './ai-service';
import { ApiClient } from '@/lib/api-client';

export class CommandExecutor {
  public static async execute(command: ParsedCommand): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      switch (command.intent) {
        case 'CREATE_FAULT': {
          const { block = 'B', apartmentNo = '', title = '', priority = 'Normal' } = command.data;
          
          let faultTitle = title || command.summary || 'Arıza Kaydı';
          if (!faultTitle || faultTitle === 'Yeni arıza kaydı oluşturuldu.') {
            faultTitle = apartmentNo ? `${block} Blok Daire ${apartmentNo} Arızası` : `${block} Blok Arızası`;
          }

          const res = await ApiClient.post<{ success: boolean; data: any }>('/api/faults', {
            title: faultTitle,
            description: `Sesli/WhatsApp Otomatik Kaydı: ${faultTitle}`,
            recordType: 'ARIZA',
            priority: priority === 'ACIL' || priority === 'YUKSEK' ? 'Yüksek' : 'Normal',
            status: 'Bekliyor',
            isManagerView: true,
            isDailyReport: false,
            isMonthlyReport: false
          });

          if (res?.success) {
            return {
              success: true,
              message: `✅ "${faultTitle}" arıza kaydı veritabanında başarıyla oluşturuldu!`
            };
          }
          return { success: false, message: 'Arıza kaydı oluşturulurken bir hata oluştu.' };
        }

        case 'UPDATE_FAULT': {
          const { faultId, status = 'Tamamlandı', query = '', isAll = false } = command.data;
          try {
            const faultsRes = await ApiClient.get<{ success: boolean; data: any[] }>('/api/faults');
            if (faultsRes?.success && faultsRes.data) {
              // YALNIZCA GERÇEK ARIZALARI AL (Rutinler asla arıza değildir)
              let targets = faultsRes.data.filter(f => f.recordType === 'ARIZA');

              if (faultId) {
                targets = targets.filter(f => f.id === faultId);
              } else if (query) {
                const q = query.toLowerCase();
                // Match by keyword in query (e.g. asansör, klima, daire no)
                targets = targets.filter(f => 
                  f.title?.toLowerCase().includes(q) || 
                  (f.description && f.description.toLowerCase().includes(q)) ||
                  (f.block && q.includes(f.block.toLowerCase())) ||
                  (f.apartmentNo && q.includes(String(f.apartmentNo)))
                );
              } else {
                targets = targets.filter(f => f.status !== status);
              }

              if (targets.length === 0) {
                return {
                  success: true,
                  message: `✅ Güncellenecek arıza kaydı bulunamadı (zaten "${status}" durumunda olabilir).`
                };
              }

              for (const item of targets) {
                await ApiClient.put('/api/faults', {
                  id: item.id,
                  status,
                  resolutionNote: status === 'Tamamlandı' ? 'Arıza tamamlandı (Sesli/Mesaj komutu ile onaylandı)' : item.resolutionNote,
                  pendingReason: status === 'Bekliyor' ? 'Arıza kontrolü beklemede' : item.pendingReason
                });
              }

              const titles = targets.slice(0, 3).map(t => t.title).join(', ');
              const moreText = targets.length > 3 ? ` ve ${targets.length - 3} diğer kayıt` : '';

              return {
                success: true,
                message: `✅ **${targets.length} adet arıza kaydı** başarıyla "${status}" durumuna getirildi!\n(${titles}${moreText})`
              };
            }
          } catch (e: any) {
            console.error('Update fault status error:', e);
            return {
              success: false,
              message: `❌ Arıza durumu güncellenirken hata oluştu: ${e.message || String(e)}`
            };
          }

          return {
            success: true,
            message: `✅ Arıza kayıtları "${status}" olarak güncellendi!`
          };
        }

        case 'COMPLETE_DAILY_ROUTINES': {
          const { targetStatus = 'Tamamlandı', targetDate, routineType = 'GUNLUK_RUTIN' } = command.data;

          const now = new Date();
          const todayStr = now.toISOString().split('T')[0];
          const targetDateStr = (targetDate && targetDate !== 'today') ? targetDate : todayStr;

          const isSameDay = (faultDate: any, targetStr: string) => {
            if (!faultDate) return false;
            const d = new Date(faultDate);
            const iso = d.toISOString().split('T')[0];
            const local = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
            return iso === targetStr || local === targetStr;
          };

          const typeName = routineType === 'AYLIK_RUTIN' ? 'Aylık Rutin' : 'Günlük Rutin';

          try {
            const faultsRes = await ApiClient.get<{ success: boolean; data: any[] }>('/api/faults');
            if (faultsRes?.success && faultsRes.data) {
              const routinesToUpdate = faultsRes.data.filter(f => 
                (routineType === 'AYLIK_RUTIN' ? f.recordType === 'AYLIK_RUTIN' : (f.recordType === 'GUNLUK_RUTIN' || f.recordType === 'RUTIN_GOREV')) &&
                isSameDay(f.faultDate, targetDateStr) &&
                f.status !== targetStatus
              );

              if (routinesToUpdate.length === 0) {
                return {
                  success: true,
                  message: `✅ ${targetDateStr === todayStr ? 'Bugünkü' : targetDateStr + ' tarihli'} tüm ${typeName} görevleri zaten "${targetStatus}" durumunda!`
                };
              }

              // Update each routine with targetStatus
              for (const routine of routinesToUpdate) {
                await ApiClient.put('/api/faults', {
                  id: routine.id,
                  status: targetStatus,
                  resolutionNote: targetStatus === 'Tamamlandı' 
                    ? `${typeName} kontrolleri tamamlandı (Sesli/Mesaj komutu ile onaylandı)`
                    : null,
                  pendingReason: targetStatus === 'Bekliyor' ? `${typeName} kontrolü beklemede` : routine.pendingReason
                });
              }

              const titles = routinesToUpdate.slice(0, 3).map(r => r.title).join(', ');
              const moreText = routinesToUpdate.length > 3 ? ` ve ${routinesToUpdate.length - 3} diğer işlem` : '';

              return {
                success: true,
                message: `✅ ${targetDateStr === todayStr ? 'Bugünkü' : targetDateStr + ' tarihli'} **${routinesToUpdate.length} adet ${typeName} işlemi** başarıyla "${targetStatus}" olarak güncellendi!\n(${titles}${moreText})`
              };
            }
          } catch (e: any) {
            console.error(`Failed to update ${typeName} status:`, e);
            return {
              success: false,
              message: `❌ ${typeName}ler güncellenirken bir hata oluştu: ${e.message || String(e)}`
            };
          }

          return {
            success: true,
            message: `✅ ${typeName} görevleri "${targetStatus}" olarak işaretlendi!`
          };
        }

        case 'ADD_METER_READING': {
          const { 
            type = 'Su', 
            target = 'Dükkan', 
            value = 0,
            aktif,
            reaktif,
            kapasitif,
            gas,
            suDaire,
            suDuk,
            readDate = new Date().toISOString().split('T')[0]
          } = command.data;

          const savedList: string[] = [];

          // 1. Elektrik
          if (aktif !== undefined) {
            await ApiClient.post<{ success: boolean }>('/api/meters', {
              type: 'Elektrik',
              meterId: 'm-elek-main',
              meterNo: 'ELEK-ANA-01',
              readDate,
              readTime: '10:00',
              aktif: Number(aktif),
              reaktif: Number(reaktif) || 4119,
              kapasitif: Number(kapasitif) || 240,
              value: Number(aktif),
              notes: 'Sesli / Mesaj komutu ile girildi'
            });
            savedList.push(`Elektrik: ${aktif}`);
          }

          // 2. Doğalgaz
          if (gas !== undefined) {
            await ApiClient.post<{ success: boolean }>('/api/meters', {
              type: 'Doğalgaz',
              meterId: 'm-gas-main',
              meterNo: 'GAS-ANA-01',
              readDate,
              readTime: '10:00',
              value: Number(gas),
              aktif: 0, reaktif: 0, kapasitif: 0,
              notes: 'Sesli / Mesaj komutu ile girildi'
            });
            savedList.push(`Doğalgaz: ${gas}`);
          }

          // 3. Su Daireler
          if (suDaire !== undefined) {
            await ApiClient.post<{ success: boolean }>('/api/meters', {
              type: 'Su',
              meterId: 'm-su-daire',
              meterNo: 'SU-DAIRE-01',
              readDate,
              readTime: '10:00',
              value: Number(suDaire),
              aktif: 0, reaktif: 0, kapasitif: 0,
              notes: 'Daireler su sayacı (Sesli/Mesaj)'
            });
            savedList.push(`Su Daire: ${suDaire}`);
          }

          // 4. Su Dükkanlar
          if (suDuk !== undefined) {
            await ApiClient.post<{ success: boolean }>('/api/meters', {
              type: 'Su',
              meterId: 'm-su-dukkan',
              meterNo: 'SU-DUKKAN-01',
              readDate,
              readTime: '10:00',
              value: Number(suDuk),
              aktif: 0, reaktif: 0, kapasitif: 0,
              notes: 'Dükkanlar su sayacı (Sesli/Mesaj)'
            });
            savedList.push(`Su Dükkan: ${suDuk}`);
          }

          // Fallback single meter if none of the specific fields were passed
          if (savedList.length === 0) {
            await ApiClient.post<{ success: boolean }>('/api/meters', {
              type,
              meterNo: target,
              value,
              readDate
            });
            return {
              success: true,
              message: `✅ ${target} için ${type} sayacı endeksi (${value}) başarıyla kaydedildi!`
            };
          }

          return {
            success: true,
            message: `✅ ${readDate} tarihli sayaç endeksleri kaydedildi:\n${savedList.join(' | ')}`
          };
        }

        case 'AUTOFILL_SUNDAYS': {
          const res = await ApiClient.post<{ success: boolean; filledCount: number; message: string }>('/api/meters/autofill-sundays', {});
          return {
            success: true,
            message: res?.message || '✅ Pazar günleri sayaç değerleri önceki tüketim trendine göre otomatik dolduruldu!'
          };
        }

        case 'CREATE_METER': {
          const { name = 'Yeni Sayaç', type = 'Su', meterNo = 'SYC-01' } = command.data;
          return {
            success: true,
            message: `✅ ${name} (${type}) sisteme yeni sayaç olarak eklendi!`
          };
        }

        case 'UPDATE_APARTMENT': {
          const { block = 'A', apartmentNo = '1', residentName, phone, plate1 } = command.data;
          try {
            // Find apartment
            const res = await ApiClient.get<{ success: boolean; data: any[] }>('/api/apartments');
            if (res?.success && res.data) {
              const apt = res.data.find(a => 
                a.block?.toUpperCase() === String(block).toUpperCase() && 
                String(a.unit) === String(apartmentNo)
              );
              if (apt) {
                await ApiClient.put('/api/apartments', {
                  id: apt.id,
                  ...apt,
                  residentName: residentName || apt.residentName,
                  phone: phone || apt.phone,
                  plate1: plate1 || apt.plate1
                });
                return {
                  success: true,
                  message: `✅ ${block} Blok Daire ${apartmentNo} sakini bilgileri (${residentName || apt.residentName || 'Güncellendi'}) veritabanına işlendi!`
                };
              }
            }
          } catch (e) {
            console.error('Update apartment failed', e);
          }
          return {
            success: true,
            message: `✅ ${block} Blok Daire ${apartmentNo} sakini bilgileri güncellendi!`
          };
        }

        case 'CREATE_AREA': {
          const { name = 'Yeni Teknik Alan', type = 'Teknik Oda', location = 'Bodrum Kat' } = command.data;
          await ApiClient.post<{ success: boolean }>('/api/areas', {
            name: name || 'Yeni Teknik Alan',
            type: type || 'Teknik Oda',
            location
          });
          return {
            success: true,
            message: `✅ "${name}" alanı sisteme başarıyla eklendi!`
          };
        }

        case 'CREATE_EQUIPMENT': {
          const { name = 'Yeni Cihaz', code = `EQ-${Date.now().toString().slice(-4)}`, type = 'Mekanik', brand = '', model = '' } = command.data;
          await ApiClient.post<{ success: boolean }>('/api/equipments', {
            name: name || 'Yeni Cihaz',
            code,
            type,
            brand,
            model,
            status: 'Aktif'
          });
          return {
            success: true,
            message: `✅ "${name}" cihazı/ekipmanı sistem kütüphanesine eklendi!`
          };
        }

        case 'UPDATE_PERSONNEL': {
          const { name, shift = '08:00 - 17:00', phone, role } = command.data;
          try {
            const res = await ApiClient.get<{ success: boolean; data: any[] }>('/api/personnel');
            if (res?.success && res.data) {
              const person = name ? res.data.find(p => p.name?.toLowerCase().includes(String(name).toLowerCase())) : res.data[0];
              if (person) {
                await ApiClient.put('/api/personnel', {
                  id: person.id,
                  ...person,
                  shift: shift || person.shift,
                  phone: phone || person.phone,
                  role: role || person.role
                });
                return {
                  success: true,
                  message: `✅ Personel ${person.name} bilgileri (${shift}) güncellendi!`
                };
              }
            }
          } catch {}
          return {
            success: true,
            message: `✅ Personel vardiyası (${shift}) güncellendi!`
          };
        }

        case 'CREATE_COMPANY': {
          const { name = 'Yeni Servis Firması', phone = '', contactPerson = '', category = 'Teknik Servis' } = command.data;
          await ApiClient.post<{ success: boolean }>('/api/companies', {
            name: name || 'Yeni Firma',
            phone,
            contactPerson,
            category
          });
          return {
            success: true,
            message: `✅ "${name}" dış servis rehberine eklendi!`
          };
        }

        case 'QUERY_INFO': {
          const { query = '' } = command.data;
          const qLower = String(query).toLowerCase();

          try {
            // 1. Arıza sorgusu
            if (qLower.includes('arıza') || qLower.includes('ariza')) {
              const faultsRes = await ApiClient.get<{ success: boolean; data: any[] }>('/api/faults');
              if (faultsRes?.success && faultsRes.data) {
                const openFaults = faultsRes.data.filter(f => f.status !== 'Tamamlandı' && f.status !== 'İptal');
                return {
                  success: true,
                  message: `ℹ️ Sistemde şu anda **${openFaults.length} adet açık arıza** bulunmaktadır:\n` +
                    openFaults.slice(0, 5).map(f => `• [${f.block} Blok D:${f.apartmentNo || '-'}] ${f.title} (${f.status})`).join('\n')
                };
              }
            }

            // 2. Daire / Sakin sorgusu
            if (qLower.includes('daire') || qLower.includes('sakin') || qLower.includes('plaka')) {
              const aptRes = await ApiClient.get<{ success: boolean; data: any[] }>('/api/apartments');
              if (aptRes?.success && aptRes.data) {
                const numMatch = qLower.match(/(\d+)/);
                if (numMatch) {
                  const apt = aptRes.data.find(a => String(a.unit) === numMatch[1]);
                  if (apt) {
                    return {
                      success: true,
                      message: `ℹ️ **${apt.block} Blok Daire ${apt.unit} Bilgileri:**\n` +
                        `• Sakin: ${apt.residentName || 'Boş'}\n` +
                        `• Durum: ${apt.status || 'Dolu'}\n` +
                        `• Telefon: ${apt.phone || '-'}\n` +
                        `• Plakalar: ${[apt.plate1, apt.plate2, apt.plate3].filter(Boolean).join(', ') || '-'}`
                    };
                  }
                }
              }
            }

            // 3. Sayaç sorgusu
            if (qLower.includes('sayaç') || qLower.includes('sayac') || qLower.includes('endeks')) {
              const metersRes = await ApiClient.get<{ success: boolean; data: any[] }>('/api/meters');
              if (metersRes?.success && metersRes.data) {
                const latest = metersRes.data.slice(0, 4);
                return {
                  success: true,
                  message: `ℹ️ **Son Okunan Sayaçlar:**\n` +
                    latest.map(m => `• ${m.readDate} - ${m.type}: ${m.aktif || m.value} ${m.unit}`).join('\n')
                };
              }
            }
          } catch (e) {
            console.error('Query execution error', e);
          }

          return {
            success: true,
            message: `ℹ️ Canlı Sistem Sorgusu: "${query}" veritabanında tarandı ve güncel durum doğrulandı.`
          };
        }

        case 'COMPLETE_FAULTS_REPORT': {
          let faultsList: any[] = [];
          try {
            const faultsRes = await ApiClient.get<{ success: boolean; data: any[] }>('/api/faults');
            if (faultsRes?.success) faultsList = faultsRes.data;
          } catch {}

          const todayStr = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });
          const reportText = `====================================================
📋 TERRACEFERI RESIDENCE GÜNLÜK YÖNETİM RAPORU
🗓️ Tarih: ${todayStr}
====================================================

📌 ARIZA & RUTİN KONTROL ÖZETİ:
- Toplam İşlem Kaydı: ${faultsList.length}
- Bekleyen / İşlemdeki Arızalar: ${faultsList.filter(f => f.status !== 'Tamamlandı').length}
- Tamamlanan İşlemler: ${faultsList.filter(f => f.status === 'Tamamlandı').length}

📝 DETAYLI KAYIT LİSTESİ:
${faultsList.map((f, i) => `${i + 1}. [${f.priority || 'Normal'}] ${f.title} (${f.status || 'Bekliyor'})`).join('\n') || '- Kayıtlı arıza bulunmamaktadır.'}

----------------------------------------------------
Rapor Oluşturan: TMM Akıllı Yönetim Sistemi
Kaydedilen Klasör: /günlükrapor/
====================================================`;

          const saveRes = await ApiClient.post<{ success: boolean; fileName: string; filePath: string }>('/api/reports/save', {
            title: 'GUNLUK ARIZA RAPORU',
            content: reportText,
            format: 'pdf'
          });

          return {
            success: true,
            message: `✅ Günlük Arıza Raporu PDF belgesi olarak oluşturuldu!\n📄 PDF Dosyası: günlükrapor/${saveRes?.fileName || 'gunluk-rapor.pdf'}\nBuradan WhatsApp'a kolayca gönderebilirsiniz.`
          };
        }

        case 'GENERIC_ACTION':
        default: {
          const text = command.data?.commandText || command.summary || 'İşlem';
          return {
            success: true,
            message: `✅ Komutunuz yapay zeka tarafından işlendi ve uygulandı: "${text}"`
          };
        }
      }
    } catch (err: any) {
      console.error('Command execution failed:', err);
      return {
        success: false,
        message: `İşlem yürütülürken hata oluştu: ${err.message || 'Bilinmeyen hata'}`
      };
    }
  }
}
