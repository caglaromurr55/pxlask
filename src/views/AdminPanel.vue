<template>
  <div class="modern-admin-container">
    <!-- Modern Üst Bar -->
    <header class="admin-navbar">
      <div class="nav-left">
        <button class="modern-btn btn-ghost back-btn" @click="$router.push('/')">
          ← Uygulamaya Dön
        </button>
        <div class="admin-brand">
          <span class="brand-badge">ADMIN</span>
          <h1 class="brand-title">Yönetim Paneli</h1>
        </div>
      </div>
      <div class="nav-right">
        <div class="status-chip">
          <span class="chip-label">Sevgili (Aşkım) Bakiyesi:</span>
          <strong class="chip-val" :class="store.points < 0 ? 'text-danger' : ''">⭐ {{ store.points }}</strong>
        </div>
        <div class="status-chip">
          <span class="chip-label">Ring Canı:</span>
          <strong class="chip-val text-danger">{{ formatNumber(store.boyfriendHp) }} / 1M</strong>
        </div>
      </div>
    </header>

    <!-- Bildirim Toast Mesajı -->
    <transition name="toast-anim">
      <div v-if="toastMsg" class="admin-toast">
        {{ toastMsg }}
      </div>
    </transition>

    <!-- Ana Panel İçeriği -->
    <div class="admin-layout">
      <!-- Sekme Menüsü -->
      <nav class="admin-nav-tabs">
        <button
          class="nav-tab-btn"
          :class="{ active: currentTab === 'points' }"
          @click="currentTab = 'points'"
        >
          <span class="tab-icon">💰</span>
          <span class="tab-text">Puan & Can Kontrolü</span>
        </button>

        <button
          class="nav-tab-btn"
          :class="{ active: currentTab === 'materials' }"
          @click="currentTab = 'materials'"
        >
          <span class="tab-icon">🗡️</span>
          <span class="tab-text">Silahlar & Hasarlar</span>
          <span class="tab-counter">{{ store.materials.length }}</span>
        </button>

        <button
          class="nav-tab-btn"
          :class="{ active: currentTab === 'tasks' }"
          @click="currentTab = 'tasks'"
        >
          <span class="tab-icon">📋</span>
          <span class="tab-text">Görev Havuzu</span>
          <span class="tab-counter">{{ totalTasksCount }}</span>
        </button>

        <button
          class="nav-tab-btn"
          :class="{ active: currentTab === 'intimate' }"
          @click="currentTab = 'intimate'"
        >
          <span class="tab-icon">🔞</span>
          <span class="tab-text">+18 Oyunlar & Görevler</span>
          <span class="tab-counter">{{ (store.kamasutraPositions?.length || 0) + (store.roleplayCards?.length || 0) + (store.scratchCards?.length || 0) + (store.intimateTasks?.length || 0) }}</span>
        </button>

        <button
          class="nav-tab-btn"
          :class="{ active: currentTab === 'rewards' }"
          @click="currentTab = 'rewards'"
        >
          <span class="tab-icon">🎁</span>
          <span class="tab-text">Ödül Mağazası</span>
          <span class="tab-counter">{{ store.rewards.length }}</span>
        </button>

        <button
          class="nav-tab-btn"
          :class="{ active: currentTab === 'poems' }"
          @click="currentTab = 'poems'"
        >
          <span class="tab-icon">📜</span>
          <span class="tab-text">Şiir Havuzu</span>
          <span class="tab-counter">{{ store.poems.length }}</span>
        </button>

        <button
          class="nav-tab-btn"
          :class="{ active: currentTab === 'system' }"
          @click="currentTab = 'system'"
        >
          <span class="tab-icon">⚙️</span>
          <span class="tab-text">Sistem & Sıfırlama</span>
        </button>
      </nav>

      <!-- Sekme İçerikleri -->
      <main class="tab-content-area">
        <!-- ============================================
             1. TAB: PUAN & CAN KONTROLÜ
             ============================================ -->
        <section v-if="currentTab === 'points'" class="content-section">
          <div class="section-header">
            <div>
              <h2 class="section-title">Puan ve Can Yönetimi</h2>
              <p class="section-desc">Sevgilinin puan bakiyesini ve ringdeki erkek arkadaş canını buradan anında değiştirebilirsin.</p>
            </div>
          </div>

          <div class="cards-grid-2">
            <!-- Puan Kartı -->
            <div class="admin-card">
              <div class="card-head">
                <h3 class="card-title">⭐ Sevgilinin (Aşkım) Puanı</h3>
                <span class="card-badge" :class="store.points < 0 ? 'bg-danger' : 'bg-gold'">{{ store.points }} Puan</span>
              </div>
              <div class="card-body">
                <p class="text-xs text-muted mb-2">💡 <em>Not: Puan eksiye (-⭐) düşebilir. Sevgilinin ceza ve borç puanlarını doğrudan buradan yönetebilirsin.</em></p>
                <div class="form-group">
                  <label class="form-label">Hızlı Puan Ekle / Çıkar</label>
                  <div class="quick-btn-group">
                    <button class="modern-btn btn-outline" @click="modifyPoints(10)">+10</button>
                    <button class="modern-btn btn-outline" @click="modifyPoints(50)">+50</button>
                    <button class="modern-btn btn-outline" @click="modifyPoints(100)">+100</button>
                    <button class="modern-btn btn-outline" @click="modifyPoints(500)">+500</button>
                    <button class="modern-btn btn-danger-outline" @click="modifyPoints(-25)">-25</button>
                    <button class="modern-btn btn-danger-outline" @click="modifyPoints(-50)">-50</button>
                    <button class="modern-btn btn-danger-outline" @click="modifyPoints(-100)">-100</button>
                  </div>
                </div>

                <div class="form-group mt-3">
                  <label class="form-label">Kesin Puan Tutarı Belirle (Eksi değer yazılabilir: örn. -50)</label>
                  <div class="input-action-group">
                    <input type="number" v-model.number="customPointsInput" class="modern-input" placeholder="Yeni puan gir (örn: 100 veya -50)..." />
                    <button class="modern-btn btn-primary" @click="handleSetExactPoints">Puanı Ayarla</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Can (HP) Kartı -->
            <div class="admin-card">
              <div class="card-head">
                <h3 class="card-title">❤️ Sevgilinin Ring Canı</h3>
                <span class="card-badge bg-danger">{{ formatNumber(store.boyfriendHp) }} / 1.000.000 HP</span>
              </div>
              <div class="card-body">
                <div class="form-group">
                  <label class="form-label">Hızlı Can Durumları</label>
                  <div class="quick-btn-group">
                    <button class="modern-btn btn-success" @click="handleSetHp(1000000)">💚 Tam Can (1 Milyon)</button>
                    <button class="modern-btn btn-warning" @click="handleSetHp(500000)">⚡ %50 Can (500k)</button>
                    <button class="modern-btn btn-danger" @click="handleSetHp(10)">🔥 Pes Etme Testi (10 Can)</button>
                  </div>
                </div>

                <div class="form-group mt-3">
                  <label class="form-label">Özel Can Miktarı Belirle</label>
                  <div class="input-action-group">
                    <input type="number" v-model.number="customHpInput" class="modern-input" placeholder="Miktar (Örn: 250000)" />
                    <button class="modern-btn btn-primary" @click="handleSetExactHp">Canı Ayarla</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Aktif Atanmış Görevlerin İlerlemesini Yönetme -->
          <div class="admin-card mt-4">
            <div class="card-head">
              <h3 class="card-title">🎯 Sevgilinin Ekranındaki Aktif Görevler</h3>
              <button class="modern-btn btn-outline btn-sm" @click="handleRefreshAllAssignedTasks">🔄 Hepsini Yeniden Ata</button>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="modern-table">
                  <thead>
                    <tr>
                      <th>Tür</th>
                      <th>Görev Başlığı</th>
                      <th>İlerleme</th>
                      <th>Ödül</th>
                      <th>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    <!-- Günlük -->
                    <tr>
                      <td><span class="badge badge-daily">GÜNLÜK</span></td>
                      <td>{{ store.assignedTasks.daily ? store.assignedTasks.daily.title : 'Görev yok' }}</td>
                      <td>Tek adımlı</td>
                      <td>{{ store.assignedTasks.daily ? store.assignedTasks.daily.points + ' ⭐' : '-' }}</td>
                      <td>
                        <button class="modern-btn btn-outline btn-xs" @click="reassignTask('daily')">🎲 Yenile</button>
                      </td>
                    </tr>
                    <!-- Haftalık -->
                    <tr>
                      <td><span class="badge badge-weekly">HAFTALIK</span></td>
                      <td>{{ store.assignedTasks.weekly ? store.assignedTasks.weekly.title : 'Görev yok' }}</td>
                      <td>
                        <div v-if="store.assignedTasks.weekly" class="inline-progress">
                          <input
                            type="number"
                            class="modern-input input-xs"
                            v-model.number="store.assignedTasks.weekly.currentCount"
                            @change="saveChanges"
                          />
                          <span>/ {{ store.assignedTasks.weekly.targetCount }} {{ store.assignedTasks.weekly.unit }}</span>
                        </div>
                        <span v-else>-</span>
                      </td>
                      <td>{{ store.assignedTasks.weekly ? store.assignedTasks.weekly.points + ' ⭐' : '-' }}</td>
                      <td>
                        <button class="modern-btn btn-outline btn-xs" @click="reassignTask('weekly')">🎲 Yenile</button>
                      </td>
                    </tr>
                    <!-- Aylık -->
                    <tr>
                      <td><span class="badge badge-monthly">AYLIK</span></td>
                      <td>{{ store.assignedTasks.monthly ? store.assignedTasks.monthly.title : 'Görev yok' }}</td>
                      <td>
                        <div v-if="store.assignedTasks.monthly" class="inline-progress">
                          <input
                            type="number"
                            class="modern-input input-xs"
                            v-model.number="store.assignedTasks.monthly.currentCount"
                            @change="saveChanges"
                          />
                          <span>/ {{ store.assignedTasks.monthly.targetCount }} {{ store.assignedTasks.monthly.unit }}</span>
                        </div>
                        <span v-else>-</span>
                      </td>
                      <td>{{ store.assignedTasks.monthly ? store.assignedTasks.monthly.points + ' ⭐' : '-' }}</td>
                      <td>
                        <button class="modern-btn btn-outline btn-xs" @click="reassignTask('monthly')">🎲 Yenile</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <!-- ============================================
             2. TAB: SİLAHLAR & HASAR AYARLARI
             ============================================ -->
        <section v-if="currentTab === 'materials'" class="content-section">
          <div class="section-header">
            <div>
              <h2 class="section-title">Silahlar ve Hasar Değerleri</h2>
              <p class="section-desc">Her bir silahın vurduğu hasar gücünü, açılma puanını ve sevgilinin sahip olup olmadığını buradan düzenleyebilirsin.</p>
            </div>
            <button class="modern-btn btn-primary" @click="openAddMaterialModal">
              ➕ Yeni Silah Ekle
            </button>
          </div>

          <div class="table-responsive admin-card p-0">
            <table class="modern-table">
              <thead>
                <tr>
                  <th>Emoji</th>
                  <th>Silah Adı</th>
                  <th>Hasar Değeri (HP)</th>
                  <th>Açma Maliyeti</th>
                  <th>Kullanıcıda Açık mı?</th>
                  <th class="text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="mat in store.materials" :key="mat.id">
                  <td><span class="table-emoji">{{ mat.emoji }}</span></td>
                  <td>
                    <strong>{{ mat.name }}</strong>
                    <div class="text-muted text-xs">ID: {{ mat.id }}</div>
                  </td>
                  <td>
                    <span class="badge-danger font-bold">-{{ mat.damageValue }} HP Hasar</span>
                  </td>
                  <td>
                    <span class="badge-gold font-bold">{{ mat.unlockCost }} ⭐</span>
                  </td>
                  <td>
                    <button
                      class="modern-btn btn-xs"
                      :class="isUnlocked(mat.id) ? 'btn-success' : 'btn-outline'"
                      @click="toggleUnlock(mat.id)"
                      :disabled="mat.id === 'mat0'"
                    >
                      {{ isUnlocked(mat.id) ? '✅ Açık' : '🔒 Kilitli' }}
                    </button>
                  </td>
                  <td class="text-right">
                    <button class="modern-btn btn-outline btn-xs mr-2" @click="openEditMaterialModal(mat)">✏️ Düzenle</button>
                    <button
                      class="modern-btn btn-danger-outline btn-xs"
                      @click="handleDeleteMaterial(mat.id)"
                      :disabled="mat.id === 'mat0'"
                    >
                      🗑️ Sil
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- ============================================
             3. TAB: GÖREV HAVUZU
             ============================================ -->
        <section v-if="currentTab === 'tasks'" class="content-section">
          <div class="section-header">
            <div>
              <h2 class="section-title">Görev Havuzu Yönetimi</h2>
              <p class="section-desc">Sabit süresiz aşk eylemlerini (öpücük, sarılma) veya döngüsel görevleri buradan düzenleyebilirsiniz.</p>
            </div>
            <button
              class="modern-btn btn-primary"
              @click="taskFrequencyTab === 'standard' ? openAddStandardTaskModal() : openAddTaskModal()"
            >
              ➕ {{ taskFrequencyTab === 'standard' ? 'Yeni Sabit Görev Ekle' : 'Yeni Görev Ekle' }}
            </button>
          </div>

          <!-- Görev Türü Filtresi -->
          <div class="sub-filter-tabs">
            <button
              class="sub-filter-btn"
              :class="{ active: taskFrequencyTab === 'standard' }"
              @click="taskFrequencyTab = 'standard'"
            >
              ♾️ Sabit / Süresiz ({{ (store.standardTasks || []).length }})
            </button>
            <button
              class="sub-filter-btn"
              :class="{ active: taskFrequencyTab === 'daily' }"
              @click="taskFrequencyTab = 'daily'"
            >
              📅 Günlük Görevler ({{ store.dailyTasks.length }})
            </button>
            <button
              class="sub-filter-btn"
              :class="{ active: taskFrequencyTab === 'weekly' }"
              @click="taskFrequencyTab = 'weekly'"
            >
              📆 Haftalık Görevler ({{ store.weeklyTasks.length }})
            </button>
            <button
              class="sub-filter-btn"
              :class="{ active: taskFrequencyTab === 'monthly' }"
              @click="taskFrequencyTab = 'monthly'"
            >
              🗓️ Aylık Görevler ({{ store.monthlyTasks.length }})
            </button>
          </div>

          <!-- 1. STANDART / SÜRESİZ GÖREVLER TABLOSU -->
          <div v-if="taskFrequencyTab === 'standard'" class="table-responsive admin-card p-0 mt-3">
            <table class="modern-table">
              <thead>
                <tr>
                  <th>Emoji</th>
                  <th>Sabit Görev Adı</th>
                  <th>Birim Puanı</th>
                  <th>Birim</th>
                  <th>Açıklama</th>
                  <th class="text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="task in store.standardTasks" :key="task.id">
                  <td><span class="table-emoji">{{ task.emoji }}</span></td>
                  <td>
                    <strong>{{ task.title }}</strong>
                    <div class="text-muted text-xs">ID: {{ task.id }}</div>
                  </td>
                  <td>
                    <span class="badge-gold font-bold">+{{ task.pointsPerUnit }} ⭐ / {{ task.unit }}</span>
                  </td>
                  <td>
                    <span class="badge badge-neutral">{{ task.unit }}</span>
                  </td>
                  <td>
                    <span class="text-xs text-muted">{{ task.description || '-' }}</span>
                  </td>
                  <td class="text-right">
                    <button class="modern-btn btn-outline btn-xs mr-2" @click="openEditStandardTaskModal(task)">✏️ Düzenle</button>
                    <button class="modern-btn btn-danger-outline btn-xs" @click="handleDeleteStandardTask(task.id)">🗑️ Sil</button>
                  </td>
                </tr>
                <tr v-if="!store.standardTasks || store.standardTasks.length === 0">
                  <td colspan="6" class="text-center text-muted py-4">Henüz kayıtlı sabit görev bulunmuyor.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 2. DÖNGÜSEL GÖREVLER TABLOSU (GÜNLÜK, HAFTALIK, AYLIK) -->
          <div v-else class="table-responsive admin-card p-0 mt-3">
            <table class="modern-table">
              <thead>
                <tr>
                  <th>Görev Başlığı</th>
                  <th>Hedef Sayı / Birim</th>
                  <th>Kazanılacak Puan</th>
                  <th class="text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="task in activeTaskList" :key="task.id">
                  <td>
                    <strong>{{ task.title }}</strong>
                  </td>
                  <td>
                    <span v-if="taskFrequencyTab !== 'daily'" class="badge badge-neutral">
                      {{ task.targetCount || '-' }} {{ task.unit || 'kez' }}
                    </span>
                    <span v-else class="text-muted text-xs">Tek adımlı</span>
                  </td>
                  <td>
                    <span class="badge-gold font-bold">+{{ task.points }} ⭐</span>
                  </td>
                  <td class="text-right">
                    <button class="modern-btn btn-outline btn-xs mr-2" @click="openEditTaskModal(task)">✏️ Düzenle</button>
                    <button class="modern-btn btn-danger-outline btn-xs" @click="handleDeleteTask(task.id)">🗑️ Sil</button>
                  </td>
                </tr>
                <tr v-if="activeTaskList.length === 0">
                  <td colspan="4" class="text-center text-muted py-4">Bu kategoride henüz görev bulunmuyor.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- ============================================
             4. TAB: ÖDÜLLER MAĞAZASI
             ============================================ -->
        <section v-if="currentTab === 'rewards'" class="content-section">
          <div class="section-header">
            <div>
              <h2 class="section-title">Ödül Mağazası Yönetimi</h2>
              <p class="section-desc">Sevgilinin puanlarıyla satın alabileceği ödülleri ve maliyetlerini belirleyin.</p>
            </div>
            <button class="modern-btn btn-primary" @click="openAddRewardModal">
              ➕ Yeni Ödül Ekle
            </button>
          </div>

          <div class="table-responsive admin-card p-0">
            <table class="modern-table">
              <thead>
                <tr>
                  <th>Emoji</th>
                  <th>Ödül Başlığı</th>
                  <th>Açıklama</th>
                  <th>Gereken Puan</th>
                  <th>Tür</th>
                  <th class="text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="reward in store.rewards" :key="reward.id">
                  <td><span class="table-emoji">{{ reward.emoji }}</span></td>
                  <td><strong>{{ reward.title }}</strong></td>
                  <td class="text-muted text-sm">{{ reward.description }}</td>
                  <td><span class="badge-gold font-bold">{{ reward.cost }} ⭐</span></td>
                  <td>
                    <span :class="reward.type === 'poem' ? 'badge badge-monthly' : 'badge badge-daily'">
                      {{ reward.type === 'poem' ? 'Şiir Havuzu' : 'Özel Ödül' }}
                    </span>
                  </td>
                  <td class="text-right">
                    <button class="modern-btn btn-outline btn-xs mr-2" @click="openEditRewardModal(reward)">✏️ Düzenle</button>
                    <button class="modern-btn btn-danger-outline btn-xs" @click="handleDeleteReward(reward.id)">🗑️ Sil</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Sevgilinin Aldığı Ödüller Geçmişi -->
          <div class="admin-card mt-4">
            <div class="card-head">
              <h3 class="card-title">📜 Sevgilinin Satın Aldığı Ödüller ({{ store.acquiredRewards.length }})</h3>
            </div>
            <div class="card-body">
              <div v-if="store.acquiredRewards.length === 0" class="text-muted text-sm py-2">
                Henüz satın alınmış bir ödül yok.
              </div>
              <ul v-else class="claimed-rewards-list">
                <li v-for="(item, idx) in store.acquiredRewards" :key="idx" class="claimed-item">
                  <span class="ci-emoji">{{ item.emoji }}</span>
                  <div class="ci-info">
                    <strong>{{ item.title }}</strong>
                    <span class="ci-date">{{ formatDate(item.acquiredAt) }}</span>
                  </div>
                  <button class="modern-btn btn-outline btn-xs" @click="removeClaimedReward(idx)">Kullanıldı / Sil</button>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <!-- ============================================
             5. TAB: ŞİİR HAVUZU
             ============================================ -->
        <section v-if="currentTab === 'poems'" class="content-section">
          <div class="section-header">
            <div>
              <h2 class="section-title">Şiir Havuzu Yönetimi</h2>
              <p class="section-desc">Sevgiline yazdığın romantik şiirleri buraya ekle. Puan harcayarak her seferinde rastgele birini açabilir.</p>
            </div>
            <button class="modern-btn btn-primary" @click="openAddPoemModal">
              ➕ Yeni Şiir Ekle
            </button>
          </div>

          <div class="cards-grid-2">
            <div v-for="poem in store.poems" :key="poem.id" class="admin-card poem-admin-card">
              <div class="card-head">
                <h3 class="card-title">📜 {{ poem.title }}</h3>
                <span
                  class="card-badge"
                  :class="isPoemUnlocked(poem.id) ? 'bg-success' : 'bg-neutral'"
                >
                  {{ isPoemUnlocked(poem.id) ? '✅ Sevgili Açtı' : '🔒 Beklemede' }}
                </span>
              </div>
              <div class="card-body">
                <pre class="poem-preview-box">{{ poem.content }}</pre>
              </div>
              <div class="card-footer">
                <button class="modern-btn btn-outline btn-sm mr-2" @click="openEditPoemModal(poem)">✏️ Düzenle</button>
                <button class="modern-btn btn-danger-outline btn-sm" @click="handleDeletePoem(poem.id)">🗑️ Sil</button>
              </div>
            </div>
          </div>
        </section>

        <!-- ============================================
             TAB: +18 OYUNLAR, KAMASUTRA, ROL YAPMA & GÖREVLER
             ============================================ -->
        <section v-if="currentTab === 'intimate'" class="content-section">
          <!-- Alt Sekme Filtresi -->
          <div class="sub-filter-tabs mb-4">
            <button
              class="sub-filter-btn"
              :class="{ active: intimateSubTab === 'kamasutra' }"
              @click="intimateSubTab = 'kamasutra'"
            >
              🪷 Pozisyon Çarkı ({{ (store.kamasutraPositions || []).length }})
            </button>
            <button
              class="sub-filter-btn"
              :class="{ active: intimateSubTab === 'roleplay' }"
              @click="intimateSubTab = 'roleplay'"
            >
              🎭 Rol Yapma ({{ (store.roleplayCards || []).length }})
            </button>
            <button
              class="sub-filter-btn"
              :class="{ active: intimateSubTab === 'scratch' }"
              @click="intimateSubTab = 'scratch'"
            >
              🎫 Kazı Kazan ({{ (store.scratchCards || []).length }})
            </button>
            <button
              class="sub-filter-btn"
              :class="{ active: intimateSubTab === 'tasks' }"
              @click="intimateSubTab = 'tasks'"
            >
              🔥 Cinsel Görevler ({{ (store.intimateTasks || []).length }})
            </button>
            <button
              class="sub-filter-btn"
              :class="{ active: intimateSubTab === 'fantasies' }"
              @click="intimateSubTab = 'fantasies'"
            >
              ✨ Fantezi Havuzu ({{ (store.fantasyPool || []).length }})
            </button>
            <button
              class="sub-filter-btn"
              :class="{ active: intimateSubTab === 'rps' }"
              @click="intimateSubTab = 'rps'"
            >
              ⚔️ Düello Ayarı
            </button>
          </div>

          <!-- 1. KAMASUTRA POZİSYONLARI TABLOSU -->
          <div v-if="intimateSubTab === 'kamasutra'">
            <div class="section-header">
              <div>
                <h2 class="section-title">🪷 Kamasutra Pozisyon Çarkı Havuzu</h2>
                <p class="section-desc">Çarkta dönecek tüm pozisyonları, kategorileri ve özel tutku ipuçlarını buradan yönetebilirsiniz.</p>
              </div>
              <button class="modern-btn btn-primary" @click="openAddKamasutraModal">
                ➕ Yeni Pozisyon Ekle
              </button>
            </div>

            <div class="table-responsive admin-card p-0 mt-3">
              <table class="modern-table">
                <thead>
                  <tr>
                    <th>Emoji</th>
                    <th>Pozisyon Başlığı</th>
                    <th>Kategori</th>
                    <th>Zorluk</th>
                    <th>Açıklama</th>
                    <th>Tutku İpucu</th>
                    <th class="text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="p in store.kamasutraPositions" :key="p.id">
                    <td><span class="table-emoji">{{ p.emoji }}</span></td>
                    <td><strong>{{ p.title }}</strong></td>
                    <td><span class="badge badge-neutral">{{ p.category }}</span></td>
                    <td><span class="badge-gold font-bold">{{ p.difficulty }}</span></td>
                    <td class="text-sm text-muted">{{ p.description }}</td>
                    <td class="text-sm text-muted"><em>{{ p.tip || '-' }}</em></td>
                    <td class="text-right">
                      <button class="modern-btn btn-outline btn-xs mr-2" @click="openEditKamasutraModal(p)">✏️ Düzenle</button>
                      <button class="modern-btn btn-danger-outline btn-xs" @click="handleDeleteKamasutra(p.id)">🗑️ Sil</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 2. ROL YAPMA (ROLEPLAY) SENARYO TABLOSU -->
          <div v-if="intimateSubTab === 'roleplay'">
            <div class="section-header">
              <div>
                <h2 class="section-title">🎭 Gizli Rol Yapma (Roleplay) Senaryo Havuzu</h2>
                <p class="section-desc">Gizli desteden çekilecek rol yapma oyunlarını, mekanları ve altın kuralları yönetin.</p>
              </div>
              <button class="modern-btn btn-primary" @click="openAddRoleplayModal">
                ➕ Yeni Senaryo Ekle
              </button>
            </div>

            <div class="table-responsive admin-card p-0 mt-3">
              <table class="modern-table">
                <thead>
                  <tr>
                    <th>Emoji</th>
                    <th>Senaryo Adı</th>
                    <th>Ortam / Mekan</th>
                    <th>1. Partner Rolü</th>
                    <th>2. Partner Rolü</th>
                    <th>Altın Kural</th>
                    <th class="text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="c in store.roleplayCards" :key="c.id">
                    <td><span class="table-emoji">{{ c.emoji }}</span></td>
                    <td><strong>{{ c.title }}</strong></td>
                    <td><span class="badge badge-neutral">{{ c.setting }}</span></td>
                    <td class="text-sm text-muted">{{ c.partner1Role }}</td>
                    <td class="text-sm text-muted">{{ c.partner2Role }}</td>
                    <td class="text-sm text-muted"><em>{{ c.rules }}</em></td>
                    <td class="text-right">
                      <button class="modern-btn btn-outline btn-xs mr-2" @click="openEditRoleplayModal(c)">✏️ Düzenle</button>
                      <button class="modern-btn btn-danger-outline btn-xs" @click="handleDeleteRoleplay(c.id)">🗑️ Sil</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 3. KAZI KAZAN KARTLARI TABLOSU -->
          <div v-if="intimateSubTab === 'scratch'">
            <div class="section-header">
              <div>
                <h2 class="section-title">🎫 Yaramaz Kazı Kazan Kartları Havuzu</h2>
                <p class="section-desc">Sevgilinin Tutku Odası'na her girdiğinde 1 kez kazıyabileceği sürpriz kartları buradan düzenleyin.</p>
              </div>
              <button class="modern-btn btn-primary" @click="openAddScratchModal">
                ➕ Yeni Kazı Kazan Kartı Ekle
              </button>
            </div>

            <div class="table-responsive admin-card p-0 mt-3">
              <table class="modern-table">
                <thead>
                  <tr>
                    <th>Emoji</th>
                    <th>Kart Başlığı</th>
                    <th>İpucu</th>
                    <th>Gizli Sürpriz İçeriği</th>
                    <th class="text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="sc in store.scratchCards" :key="sc.id">
                    <td><span class="table-emoji">{{ sc.emoji || '🎁' }}</span></td>
                    <td><strong>{{ sc.title }}</strong></td>
                    <td><span class="badge badge-neutral">{{ sc.hint || 'DOKUN & KAZI' }}</span></td>
                    <td class="text-sm text-muted">{{ sc.content || sc.description }}</td>
                    <td class="text-right">
                      <button class="modern-btn btn-outline btn-xs mr-2" @click="openEditScratchModal(sc)">✏️ Düzenle</button>
                      <button class="modern-btn btn-danger-outline btn-xs" @click="handleDeleteScratch(sc.id)">🗑️ Sil</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 4. ZORUNLU CİNSEL GÖREVLER -->
          <div v-if="intimateSubTab === 'tasks'">
            <div class="section-header">
              <div>
                <h2 class="section-title">🔥 Zorunlu Günlük Cinsel Görevler</h2>
                <p class="section-desc">Her gün için zorunlu kılınan cinsel görevler havuzu. Yapılmazsa belirtilen ceza puanı kesilir.</p>
              </div>
              <button class="modern-btn btn-primary" @click="openAddIntimateModal">
                ➕ Yeni Cinsel Görev Ekle
              </button>
            </div>

            <!-- Aktif Zorunlu Görev Durumu -->
            <div class="admin-card mb-4" v-if="store.activeIntimateTask">
              <div class="card-head">
                <h3 class="card-title">⚡ Bugünün Aktif Zorunlu Görevi</h3>
                <span :class="store.activeIntimateTask.isCompleted ? 'badge badge-daily' : 'badge badge-monthly'">
                  {{ store.activeIntimateTask.isCompleted ? '✅ Tamamlandı' : '⏳ Yapılmadı' }}
                </span>
              </div>
              <div class="card-body">
                <div class="font-bold text-lg mb-1">{{ store.activeIntimateTask.title }}</div>
                <div class="text-sm text-muted mb-3">
                  Ödül: +{{ store.activeIntimateTask.points }} ⭐ | Ceza: -{{ store.activeIntimateTask.penaltyPoints }} ⭐ ({{ store.activeIntimateTask.penaltyDesc }})
                </div>
                <button class="modern-btn btn-outline btn-xs" @click="reassignActiveIntimateTask">
                  🎲 Bugünün Görevini Rastgele Değiştir
                </button>
              </div>
            </div>

            <div class="table-responsive admin-card p-0 mb-5">
              <table class="modern-table">
                <thead>
                  <tr>
                    <th>Görev Başlığı</th>
                    <th>Ödül</th>
                    <th>Ceza Puanı</th>
                    <th>Ceza Açıklaması</th>
                    <th class="text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="t in store.intimateTasks" :key="t.id">
                    <td><strong>{{ t.title }}</strong></td>
                    <td><span class="badge-gold font-bold">+{{ t.points }} ⭐</span></td>
                    <td><span class="badge-danger font-bold">-{{ t.penaltyPoints }} ⭐</span></td>
                    <td class="text-sm text-muted">{{ t.penaltyDesc }}</td>
                    <td class="text-right">
                      <button class="modern-btn btn-outline btn-xs mr-2" @click="openEditIntimateModal(t)">✏️ Düzenle</button>
                      <button class="modern-btn btn-danger-outline btn-xs" @click="handleDeleteIntimateTask(t.id)">🗑️ Sil</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 5. GÜNÜN FANTEZİSİ HAVUZU -->
          <div v-if="intimateSubTab === 'fantasies'">
            <div class="section-header">
              <div>
                <h2 class="section-title">✨ Günün Fantezisi Havuzu ({{ store.fantasyPool ? store.fantasyPool.length : 0 }})</h2>
                <p class="section-desc">Her gün sevgilinin ve senin karşına çıkacak fantezi kartları. İkiniz de "Evet" derseniz ortak listeye eklenir.</p>
              </div>
              <button class="modern-btn btn-primary" @click="openAddFantasyModal">
                ➕ Yeni Fantezi Ekle
              </button>
            </div>

            <div class="table-responsive admin-card p-0">
              <table class="modern-table">
                <thead>
                  <tr>
                    <th>Emoji</th>
                    <th>Fantezi Başlığı</th>
                    <th>Açıklama</th>
                    <th class="text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="f in store.fantasyPool" :key="f.id">
                    <td><span class="table-emoji">{{ f.emoji }}</span></td>
                    <td><strong>{{ f.title }}</strong></td>
                    <td class="text-sm text-muted">{{ f.description }}</td>
                    <td class="text-right">
                      <button class="modern-btn btn-outline btn-xs mr-2" @click="openEditFantasyModal(f)">✏️ Düzenle</button>
                      <button class="modern-btn btn-danger-outline btn-xs" @click="handleDeleteFantasy(f.id)">🗑️ Sil</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 6. TAŞ KAĞIT MAKAS DÜELLOSU AYARI -->
          <div v-if="intimateSubTab === 'rps'">
            <div class="section-header">
              <div>
                <h2 class="section-title">⚔️ Taş - Kağıt - Makas Düellosu Ceza Ayarları</h2>
                <p class="section-desc">Kararsız kalındığında oynanan düelloda 10 saniye içinde karar vermeyen tarafa uygulanacak ceza.</p>
              </div>
            </div>

            <div class="admin-card mb-5">
              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Süre Bittiğinde Düşülecek Ceza Puanı (⭐)</label>
                  <input v-model.number="rpsSettingsForm.penaltyPoints" type="number" min="0" class="modern-input" />
                </div>
                <div class="form-group">
                  <label class="form-label">Ceza Yaptırımı / Açıklaması</label>
                  <input v-model="rpsSettingsForm.penaltyDesc" class="modern-input" placeholder="Örn: Kazanan ne derse itirazsız kabul edilir!" />
                </div>
              </div>
              <button class="modern-btn btn-primary" @click="handleSaveRpsSettings">
                💾 Düello Ayarlarını Kaydet
              </button>
            </div>
          </div>
        </section>

        <!-- ============================================
             6. TAB: SİSTEM & SIFIRLAMA
             ============================================ -->
        <section v-if="currentTab === 'system'" class="content-section">
          <div class="section-header">
            <div>
              <h2 class="section-title">Sistem Ayarları & Sıfırlama</h2>
              <p class="section-desc">Uygulama önbelleğini, görev atamalarını veya tüm veritabanı durumunu yönetebilirsiniz.</p>
            </div>
          </div>

          <div class="cards-grid-2">
            <div class="admin-card">
              <h3 class="card-title">🔄 Görev Döngüsünü Sıfırla</h3>
              <p class="card-desc">Günün görevlerini hemen sıfırlayıp sevgiline yepyeni görevler atar.</p>
              <button class="modern-btn btn-primary mt-3" @click="handleRefreshAllAssignedTasks">
                Görevleri Yeniden Dağıt
              </button>
            </div>

            <div class="admin-card border-danger">
              <h3 class="card-title text-danger">⚠️ Fabrika Ayarlarına Dön</h3>
              <p class="card-desc">Tüm puanlar, açılmış malzemeler ve görev geçmişi ilk başlangıç durumuna sıfırlanır. Bu işlem geri alınamaz!</p>
              <button class="modern-btn btn-danger mt-3" @click="handleFullReset">
                Tüm Veriyi Sıfırla
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>

    <!-- ============================================
         MODALLAR: EKLE / DÜZENLE DİYALOGLARI
         ============================================ -->
    <!-- 1. Silah Ekle / Düzenle Modalı -->
    <div v-if="materialModal.show" class="admin-modal-backdrop" @click="materialModal.show = false">
      <div class="admin-modal" @click.stop>
        <div class="modal-head">
          <h3 class="modal-title">{{ materialModal.isEdit ? 'Silahı Düzenle' : 'Yeni Silah Ekle' }}</h3>
          <button class="close-btn" @click="materialModal.show = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Silah Adı</label>
            <input v-model="materialModal.form.name" class="modern-input" placeholder="Örn: Beyzbol Sopası" />
          </div>
          <div class="form-group">
            <label class="form-label">Emoji</label>
            <input v-model="materialModal.form.emoji" class="modern-input" placeholder="Örn: 🏏" />
          </div>
          <div class="form-group">
            <label class="form-label">Hasar Gücü (HP)</label>
            <input v-model.number="materialModal.form.damageValue" type="number" min="1" class="modern-input" placeholder="Örn: 50" />
            <small class="text-muted">Her vuruşta sevgilinin canından düşecek miktar.</small>
          </div>
          <div class="form-group">
            <label class="form-label">Açma Maliyeti (⭐ Puan)</label>
            <input v-model.number="materialModal.form.unlockCost" type="number" min="0" class="modern-input" placeholder="Örn: 40" />
          </div>
          <div class="form-group">
            <label class="form-label">Ses Efekti</label>
            <select v-model="materialModal.form.sound" class="modern-input">
              <option value="slap">Tokat (Şlap)</option>
              <option value="tomato">Domates (Cıvık)</option>
              <option value="slipper">Terlik (Çat)</option>
              <option value="bonk">Tava / Sopa (Bonk)</option>
              <option value="gun">Silah (Pew Pew)</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="modern-btn btn-outline" @click="materialModal.show = false">İptal</button>
          <button class="modern-btn btn-primary" @click="saveMaterialModal">Kaydet</button>
        </div>
      </div>
    </div>

    <!-- 2. Görev Ekle / Düzenle Modalı -->
    <div v-if="taskModal.show" class="admin-modal-backdrop" @click="taskModal.show = false">
      <div class="admin-modal" @click.stop>
        <div class="modal-head">
          <h3 class="modal-title">{{ taskModal.isEdit ? 'Görevi Düzenle' : 'Yeni Görev Ekle' }}</h3>
          <button class="close-btn" @click="taskModal.show = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Görev Başlığı</label>
            <input v-model="taskModal.form.title" class="modern-input" placeholder="Örn: Bana 50 kez sarıl" />
          </div>
          <div class="form-group">
            <label class="form-label">Kazanılacak Puan (⭐)</label>
            <input v-model.number="taskModal.form.points" type="number" min="1" class="modern-input" placeholder="Örn: 50" />
          </div>
          <div class="form-group">
            <label class="form-label">Görev Periyodu</label>
            <select v-model="taskModal.form.frequency" class="modern-input" :disabled="taskModal.isEdit">
              <option value="daily">Günlük (Tek adımlı)</option>
              <option value="weekly">Haftalık (Sayaçlı)</option>
              <option value="monthly">Aylık (Sayaçlı)</option>
            </select>
          </div>
          <div v-if="taskModal.form.frequency !== 'daily'" class="form-row-2">
            <div class="form-group">
              <label class="form-label">Hedef Sayı</label>
              <input v-model.number="taskModal.form.targetCount" type="number" min="1" class="modern-input" placeholder="Örn: 1000" />
            </div>
            <div class="form-group">
              <label class="form-label">Birim</label>
              <input v-model="taskModal.form.unit" class="modern-input" placeholder="Örn: öpücük, kez" />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="modern-btn btn-outline" @click="taskModal.show = false">İptal</button>
          <button class="modern-btn btn-primary" @click="saveTaskModal">Kaydet</button>
        </div>
      </div>
    </div>

    <!-- 3. Ödül Ekle / Düzenle Modalı -->
    <div v-if="rewardModal.show" class="admin-modal-backdrop" @click="rewardModal.show = false">
      <div class="admin-modal" @click.stop>
        <div class="modal-head">
          <h3 class="modal-title">{{ rewardModal.isEdit ? 'Ödülü Düzenle' : 'Yeni Ödül Ekle' }}</h3>
          <button class="close-btn" @click="rewardModal.show = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Ödül Başlığı</label>
            <input v-model="rewardModal.form.title" class="modern-input" placeholder="Örn: Sinema Ismarlama" />
          </div>
          <div class="form-group">
            <label class="form-label">Açıklama</label>
            <input v-model="rewardModal.form.description" class="modern-input" placeholder="Örn: Biletler benden!" />
          </div>
          <div class="form-group">
            <label class="form-label">Emoji</label>
            <input v-model="rewardModal.form.emoji" class="modern-input" placeholder="Örn: 🍿" />
          </div>
          <div class="form-group">
            <label class="form-label">Maliyet (⭐ Puan)</label>
            <input v-model.number="rewardModal.form.cost" type="number" min="1" class="modern-input" placeholder="Örn: 60" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="modern-btn btn-outline" @click="rewardModal.show = false">İptal</button>
          <button class="modern-btn btn-primary" @click="saveRewardModal">Kaydet</button>
        </div>
      </div>
    </div>

    <!-- 4. Şiir Ekle / Düzenle Modalı -->
    <div v-if="poemModal.show" class="admin-modal-backdrop" @click="poemModal.show = false">
      <div class="admin-modal" @click.stop>
        <div class="modal-head">
          <h3 class="modal-title">{{ poemModal.isEdit ? 'Şiiri Düzenle' : 'Yeni Şiir Ekle' }}</h3>
          <button class="close-btn" @click="poemModal.show = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Şiir Başlığı</label>
            <input v-model="poemModal.form.title" class="modern-input" placeholder="Örn: Gözlerin" />
          </div>
          <div class="form-group">
            <label class="form-label">Şiir Dörtlükleri / İçerik</label>
            <textarea v-model="poemModal.form.content" rows="6" class="modern-input modern-textarea" placeholder="Şiir mısralarını buraya yaz..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="modern-btn btn-outline" @click="poemModal.show = false">İptal</button>
          <button class="modern-btn btn-primary" @click="savePoemModal">Kaydet</button>
        </div>
      </div>
    </div>

    <!-- 5. Standart / Süresiz Görev Ekle / Düzenle Modalı -->
    <div v-if="standardTaskModal.show" class="admin-modal-backdrop" @click="standardTaskModal.show = false">
      <div class="admin-modal" @click.stop>
        <div class="modal-head">
          <h3 class="modal-title">{{ standardTaskModal.isEdit ? 'Sabit Görevi Düzenle' : 'Yeni Sabit Görev Ekle' }}</h3>
          <button class="close-btn" @click="standardTaskModal.show = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Sabit Görev Başlığı</label>
            <input v-model="standardTaskModal.form.title" class="modern-input" placeholder="Örn: Öpücük, Masaj, Kahve Hazırlamak..." />
          </div>
          <div class="form-group">
            <label class="form-label">Emoji</label>
            <input v-model="standardTaskModal.form.emoji" class="modern-input" placeholder="Örn: 💋, 🫂, ☕, 💆‍♀️" />
          </div>
          <div class="form-group">
            <label class="form-label">1 Birim Başına Kazanılacak Puan (⭐)</label>
            <input v-model.number="standardTaskModal.form.pointsPerUnit" type="number" min="1" class="modern-input" placeholder="Örn: 1" />
            <small class="text-muted">Sevgilin adet girdikçe bu puan ile çarpılır (Örn: 20 öpücük x 1 = +20 ⭐).</small>
          </div>
          <div class="form-group">
            <label class="form-label">Birim Adı</label>
            <input v-model="standardTaskModal.form.unit" class="modern-input" placeholder="Örn: öpücük, adet, seans, fincan" />
          </div>
          <div class="form-group">
            <label class="form-label">Açıklama / İpucu</label>
            <input v-model="standardTaskModal.form.description" class="modern-input" placeholder="Örn: Her öptüğünde adet sayısını girip anında puan kazan!" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="modern-btn btn-outline" @click="standardTaskModal.show = false">İptal</button>
          <button class="modern-btn btn-primary" @click="saveStandardTaskModal">Kaydet</button>
        </div>
      </div>
    </div>

    <!-- Cinsel Görev Ekle / Düzenle Modalı -->
    <div v-if="intimateTaskModal.show" class="admin-modal-backdrop" @click="intimateTaskModal.show = false">
      <div class="admin-modal" @click.stop>
        <div class="modal-head">
          <h3 class="modal-title">{{ intimateTaskModal.isEdit ? 'Cinsel Görevi Düzenle' : 'Yeni Cinsel Görev Ekle' }}</h3>
          <button class="close-btn" @click="intimateTaskModal.show = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Görev Başlığı</label>
            <input v-model="intimateTaskModal.form.title" class="modern-input" placeholder="Örn: Bu gece sevgiline baştan çıkarıcı bir dans yap" />
          </div>
          <div class="form-group">
            <label class="form-label">Kazanılacak Ödül Puanı (⭐)</label>
            <input v-model.number="intimateTaskModal.form.points" type="number" min="1" class="modern-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Yapılmazsa Düşülecek Ceza Puanı (⭐)</label>
            <input v-model.number="intimateTaskModal.form.penaltyPoints" type="number" min="0" class="modern-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Ceza Açıklaması</label>
            <input v-model="intimateTaskModal.form.penaltyDesc" class="modern-input" placeholder="Örn: Yarın sabah yatakta kahvaltı hazırlayacak!" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="modern-btn btn-outline" @click="intimateTaskModal.show = false">İptal</button>
          <button class="modern-btn btn-primary" @click="saveIntimateTaskModal">Kaydet</button>
        </div>
      </div>
    </div>

    <!-- Fantezi Ekle / Düzenle Modalı -->
    <div v-if="fantasyModal.show" class="admin-modal-backdrop" @click="fantasyModal.show = false">
      <div class="admin-modal" @click.stop>
        <div class="modal-head">
          <h3 class="modal-title">{{ fantasyModal.isEdit ? 'Fanteziyi Düzenle' : 'Yeni Fantezi Ekle' }}</h3>
          <button class="close-btn" @click="fantasyModal.show = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Fantezi Başlığı</label>
            <input v-model="fantasyModal.form.title" class="modern-input" placeholder="Örn: Gözleri Bağlı Masaj" />
          </div>
          <div class="form-group">
            <label class="form-label">Emoji</label>
            <input v-model="fantasyModal.form.emoji" class="modern-input" placeholder="Örn: 🙈, 🍓, 🧊" />
          </div>
          <div class="form-group">
            <label class="form-label">Açıklama</label>
            <textarea v-model="fantasyModal.form.description" class="modern-input" rows="3" placeholder="Fantezinin detayları..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="modern-btn btn-outline" @click="fantasyModal.show = false">İptal</button>
          <button class="modern-btn btn-primary" @click="saveFantasyModal">Kaydet</button>
        </div>
      </div>
    </div>

    <!-- 7. Kamasutra Pozisyon Ekle / Düzenle Modalı -->
    <div v-if="kamasutraModal.show" class="admin-modal-backdrop" @click="kamasutraModal.show = false">
      <div class="admin-modal" @click.stop>
        <div class="modal-head">
          <h3 class="modal-title">{{ kamasutraModal.isEdit ? 'Pozisyonu Düzenle' : 'Yeni Pozisyon Ekle' }}</h3>
          <button class="close-btn" @click="kamasutraModal.show = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Pozisyon Başlığı</label>
            <input v-model="kamasutraModal.form.title" class="modern-input" placeholder="Örn: Lotus Pozisyonu" />
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">Emoji</label>
              <input v-model="kamasutraModal.form.emoji" class="modern-input" placeholder="Örn: 🪷" />
            </div>
            <div class="form-group">
              <label class="form-label">Zorluk Seviyesi</label>
              <select v-model="kamasutraModal.form.difficulty" class="modern-input">
                <option value="Kolay ⭐">Kolay ⭐</option>
                <option value="Orta ⭐⭐">Orta ⭐⭐</option>
                <option value="Zor ⭐⭐⭐">Zor ⭐⭐⭐</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Kategori</label>
            <input v-model="kamasutraModal.form.category" class="modern-input" placeholder="Örn: Romantik & Duygusal, Tutkulu..." />
          </div>
          <div class="form-group">
            <label class="form-label">Uygulanışı & Vücut Duruşları</label>
            <textarea v-model="kamasutraModal.form.description" class="modern-input" rows="3" placeholder="Pozisyonun nasıl uygulanacağını açıklayın..."></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Özel Tutku İpucu</label>
            <textarea v-model="kamasutraModal.form.tip" class="modern-input" rows="2" placeholder="Yakınlığı ve zevki artıran özel bir dokunuş veya fısıltı..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="modern-btn btn-outline" @click="kamasutraModal.show = false">İptal</button>
          <button class="modern-btn btn-primary" @click="saveKamasutraModal">Kaydet</button>
        </div>
      </div>
    </div>

    <!-- 8. Rol Yapma (Roleplay) Ekle / Düzenle Modalı -->
    <div v-if="roleplayModal.show" class="admin-modal-backdrop" @click="roleplayModal.show = false">
      <div class="admin-modal" @click.stop>
        <div class="modal-head">
          <h3 class="modal-title">{{ roleplayModal.isEdit ? 'Senaryoyu Düzenle' : 'Yeni Senaryo Ekle' }}</h3>
          <button class="close-btn" @click="roleplayModal.show = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Senaryo Başlığı</label>
            <input v-model="roleplayModal.form.title" class="modern-input" placeholder="Örn: Barda Karşılaşan İki Yabancı" />
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">Emoji</label>
              <input v-model="roleplayModal.form.emoji" class="modern-input" placeholder="Örn: 🍸, 🎭" />
            </div>
            <div class="form-group">
              <label class="form-label">Ortam / Mekan</label>
              <input v-model="roleplayModal.form.setting" class="modern-input" placeholder="Örn: Loş bir kokteyl barı" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">1. Partner Rolü</label>
            <input v-model="roleplayModal.form.partner1Role" class="modern-input" placeholder="Örn: Masada yalnız oturan gizemli yabancı" />
          </div>
          <div class="form-group">
            <label class="form-label">2. Partner Rolü</label>
            <input v-model="roleplayModal.form.partner2Role" class="modern-input" placeholder="Örn: Yanına oturup cesurca flört eden yabancı" />
          </div>
          <div class="form-group">
            <label class="form-label">Altın Kurallar</label>
            <textarea v-model="roleplayModal.form.rules" class="modern-input" rows="2" placeholder="Örn: Gerçek isimleri söylemek kesinlikle yasak!"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Atmosfer & Detay</label>
            <textarea v-model="roleplayModal.form.description" class="modern-input" rows="2" placeholder="Oyunun amacı ve havası..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="modern-btn btn-outline" @click="roleplayModal.show = false">İptal</button>
          <button class="modern-btn btn-primary" @click="saveRoleplayModal">Kaydet</button>
        </div>
      </div>
    </div>

    <!-- 9. Kazı Kazan Kartı Ekle / Düzenle Modalı -->
    <div v-if="scratchModal.show" class="admin-modal-backdrop" @click="scratchModal.show = false">
      <div class="admin-modal" @click.stop>
        <div class="modal-head">
          <h3 class="modal-title">{{ scratchModal.isEdit ? 'Kazı Kazan Kartını Düzenle' : 'Yeni Kart Ekle' }}</h3>
          <button class="close-btn" @click="scratchModal.show = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Kart Başlığı</label>
            <input v-model="scratchModal.form.title" class="modern-input" placeholder="Örn: Fısıltı Görevi" />
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">Emoji</label>
              <input v-model="scratchModal.form.emoji" class="modern-input" placeholder="Örn: 🤫, 💆, 🎁" />
            </div>
            <div class="form-group">
              <label class="form-label">Ön Yazı / İpucu</label>
              <input v-model="scratchModal.form.hint" class="modern-input" placeholder="Örn: Kazı ve öğren..." />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Gizli Sürpriz İçeriği (Kazınınca Açılacak)</label>
            <textarea v-model="scratchModal.form.content" class="modern-input" rows="3" placeholder="Kart kazındığında partnerine çıkacak sürpriz görev veya istek..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="modern-btn btn-outline" @click="scratchModal.show = false">İptal</button>
          <button class="modern-btn btn-primary" @click="saveScratchModal">Kaydet</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  store,
  setPoints,
  addPoints,
  setBoyfriendHp,
  addTask,
  updateTask,
  removeTask,
  reassignSpecificTask,
  addStandardTask,
  updateStandardTask,
  deleteStandardTask,
  addReward,
  updateReward,
  removeReward,
  addPoem,
  updatePoem,
  removePoem,
  addMaterial,
  updateMaterial,
  toggleMaterialUnlock,
  removeMaterial,
  resetState,
  assignRandomTasks,
  scheduleSave,
  addIntimateTask,
  updateIntimateTask,
  deleteIntimateTask,
  updateRpsSettings,
  addFantasy,
  updateFantasy,
  deleteFantasy,
  addKamasutraPosition,
  updateKamasutraPosition,
  deleteKamasutraPosition,
  addRoleplayCard,
  updateRoleplayCard,
  deleteRoleplayCard,
  addScratchCard,
  updateScratchCard,
  deleteScratchCard
} from '../store.js';

export default {
  name: 'AdminPanel',
  data() {
    return {
      store,
      currentTab: 'points',
      taskFrequencyTab: 'standard', // Varsayılan olarak sabit görevler açılsın
      intimateSubTab: 'kamasutra',  // +18 Oyunlar sekmesi varsayılan alt sekme
      customPointsInput: null,
      customHpInput: null,
      toastMsg: '',
      toastTimer: null,

      // Taş Kağıt Makas Ayarları
      rpsSettingsForm: {
        penaltyPoints: 25,
        penaltyDesc: ''
      },

      // Modal State'leri
      kamasutraModal: {
        show: false,
        isEdit: false,
        editId: null,
        form: { title: '', emoji: '🪷', category: 'Romantik & Duygusal', difficulty: 'Orta ⭐⭐', description: '', tip: '' }
      },
      roleplayModal: {
        show: false,
        isEdit: false,
        editId: null,
        form: { title: '', emoji: '🎭', setting: '', partner1Role: '', partner2Role: '', rules: '', description: '' }
      },
      scratchModal: {
        show: false,
        isEdit: false,
        editId: null,
        form: { title: '', emoji: '🎁', hint: 'Kazı ve öğren...', content: '' }
      },
      materialModal: {
        show: false,
        isEdit: false,
        editId: null,
        form: { name: '', emoji: '🔨', damageValue: 20, unlockCost: 30, sound: 'bonk' }
      },
      taskModal: {
        show: false,
        isEdit: false,
        editId: null,
        form: { title: '', points: 20, frequency: 'daily', targetCount: 50, unit: 'kez' }
      },
      standardTaskModal: {
        show: false,
        isEdit: false,
        editId: null,
        form: { title: '', emoji: '💋', pointsPerUnit: 1, unit: 'adet', description: '' }
      },
      intimateTaskModal: {
        show: false,
        isEdit: false,
        editId: null,
        form: { title: '', points: 30, penaltyPoints: 30, penaltyDesc: '' }
      },
      fantasyModal: {
        show: false,
        isEdit: false,
        editId: null,
        form: { title: '', description: '', emoji: '🔥', category: 'genel' }
      },
      rewardModal: {
        show: false,
        isEdit: false,
        editId: null,
        form: { title: '', description: '', cost: 40, emoji: '🎁', type: 'custom' }
      },
      poemModal: {
        show: false,
        isEdit: false,
        editId: null,
        form: { title: '', content: '' }
      }
    };
  },
  computed: {
    totalTasksCount() {
      return store.dailyTasks.length + store.weeklyTasks.length + store.monthlyTasks.length + (store.standardTasks?.length || 0);
    },
    activeTaskList() {
      if (this.taskFrequencyTab === 'daily') return store.dailyTasks;
      if (this.taskFrequencyTab === 'weekly') return store.weeklyTasks;
      return store.monthlyTasks;
    }
  },
  created() {
    if (store.rpsDuel) {
      this.rpsSettingsForm.penaltyPoints = store.rpsDuel.penaltyPoints || 25;
      this.rpsSettingsForm.penaltyDesc = store.rpsDuel.penaltyDesc || 'Kazanan ne derse itirazsız kabul edilir!';
    }
  },
  methods: {
    showToast(msg) {
      this.toastMsg = msg;
      if (this.toastTimer) clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => {
        this.toastMsg = '';
      }, 2500);
    },
    formatNumber(num) {
      if (num === undefined || num === null) return '0';
      return num.toLocaleString('tr-TR');
    },
    formatDate(dateStr) {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
    },
    saveChanges() {
      scheduleSave();
      this.showToast('Değişiklik kaydedildi!');
    },

    // Puan ve Can
    modifyPoints(amount) {
      addPoints(amount);
      this.showToast(`Puan güncellendi: ${amount > 0 ? '+' : ''}${amount} ⭐`);
    },
    handleSetExactPoints() {
      if (this.customPointsInput !== null && !isNaN(this.customPointsInput)) {
        setPoints(this.customPointsInput);
        this.showToast(`Yeni bakiye ayarlandı: ${this.customPointsInput} ⭐`);
        this.customPointsInput = null;
      }
    },
    handleSetHp(amount) {
      setBoyfriendHp(amount);
      this.showToast(`Sevgili canı ${this.formatNumber(amount)} HP yapıldı!`);
    },
    handleSetExactHp() {
      if (this.customHpInput !== null && !isNaN(this.customHpInput)) {
        setBoyfriendHp(this.customHpInput);
        this.showToast(`Sevgili canı ${this.formatNumber(this.customHpInput)} HP yapıldı!`);
        this.customHpInput = null;
      }
    },
    reassignTask(frequency) {
      reassignSpecificTask(frequency);
      this.showToast(`${frequency.toUpperCase()} görevi yeniden atandı!`);
    },
    handleRefreshAllAssignedTasks() {
      localStorage.removeItem('pixelask_lastAssign');
      store.assignedTasks = { daily: null, weekly: null, monthly: null };
      assignRandomTasks();
      this.showToast('Tüm aktif görevler yenilendi!');
    },

    // Silahlar
    isUnlocked(matId) {
      return store.unlockedMaterials.includes(matId);
    },
    toggleUnlock(matId) {
      toggleMaterialUnlock(matId);
      const isNow = this.isUnlocked(matId);
      this.showToast(`Silah durumu: ${isNow ? 'Açıldı ✅' : 'Kilitlendi 🔒'}`);
    },
    openAddMaterialModal() {
      this.materialModal = {
        show: true,
        isEdit: false,
        editId: null,
        form: { name: '', emoji: '🔨', damageValue: 20, unlockCost: 30, sound: 'bonk' }
      };
    },
    openEditMaterialModal(mat) {
      this.materialModal = {
        show: true,
        isEdit: true,
        editId: mat.id,
        form: {
          name: mat.name,
          emoji: mat.emoji,
          damageValue: mat.damageValue || 1,
          unlockCost: mat.unlockCost || 0,
          sound: mat.sound || 'bonk'
        }
      };
    },
    saveMaterialModal() {
      const f = this.materialModal.form;
      if (!f.name.trim()) return alert('Silah adı boş olamaz!');

      const fields = {
        name: f.name.trim(),
        emoji: f.emoji.trim() || '🔨',
        damageValue: parseInt(f.damageValue, 10) || 1,
        damage: `${parseInt(f.damageValue, 10) || 1} Hasar`,
        unlockCost: parseInt(f.unlockCost, 10) || 0,
        sound: f.sound
      };

      if (this.materialModal.isEdit) {
        updateMaterial(this.materialModal.editId, fields);
        this.showToast('Silah başarıyla güncellendi!');
      } else {
        addMaterial(fields);
        this.showToast('Yeni silah eklendi!');
      }
      this.materialModal.show = false;
    },
    handleDeleteMaterial(matId) {
      if (confirm('Bu silahı silmek istediğinize emin misiniz?')) {
        removeMaterial(matId);
        this.showToast('Silah silindi.');
      }
    },

    // Görevler
    openAddTaskModal() {
      this.taskModal = {
        show: true,
        isEdit: false,
        editId: null,
        form: {
          title: '',
          points: 20,
          frequency: this.taskFrequencyTab,
          targetCount: this.taskFrequencyTab === 'weekly' ? 50 : (this.taskFrequencyTab === 'monthly' ? 1000 : 1),
          unit: this.taskFrequencyTab === 'monthly' ? 'öpücük' : 'sarılma'
        }
      };
    },
    openEditTaskModal(task) {
      this.taskModal = {
        show: true,
        isEdit: true,
        editId: task.id,
        form: {
          title: task.title,
          points: task.points,
          frequency: task.frequency || this.taskFrequencyTab,
          targetCount: task.targetCount || 50,
          unit: task.unit || 'kez'
        }
      };
    },
    saveTaskModal() {
      const f = this.taskModal.form;
      if (!f.title.trim()) return alert('Görev başlığı boş olamaz!');

      const fields = {
        title: f.title.trim(),
        points: parseInt(f.points, 10) || 10,
        targetCount: f.frequency !== 'daily' ? (parseInt(f.targetCount, 10) || 50) : undefined,
        unit: f.frequency !== 'daily' ? (f.unit.trim() || 'kez') : undefined
      };

      if (this.taskModal.isEdit) {
        updateTask(this.taskModal.editId, f.frequency, fields);
        this.showToast('Görev güncellendi!');
      } else {
        addTask(fields, f.frequency);
        this.showToast('Yeni görev eklendi!');
      }
      this.taskModal.show = false;
    },
    handleDeleteTask(taskId) {
      if (confirm('Bu görevi silmek istediğinize emin misiniz?')) {
        removeTask(taskId, this.taskFrequencyTab);
        this.showToast('Görev silindi.');
      }
    },

    // Standart / Süresiz Görevler
    openAddStandardTaskModal() {
      this.standardTaskModal = {
        show: true,
        isEdit: false,
        editId: null,
        form: {
          title: '',
          emoji: '💋',
          pointsPerUnit: 1,
          unit: 'adet',
          description: ''
        }
      };
    },
    openEditStandardTaskModal(task) {
      this.standardTaskModal = {
        show: true,
        isEdit: true,
        editId: task.id,
        form: {
          title: task.title,
          emoji: task.emoji || '💋',
          pointsPerUnit: task.pointsPerUnit || 1,
          unit: task.unit || 'adet',
          description: task.description || ''
        }
      };
    },
    async saveStandardTaskModal() {
      const f = this.standardTaskModal.form;
      if (!f.title.trim()) return alert('Sabit görev başlığı boş olamaz!');

      const fields = {
        title: f.title.trim(),
        emoji: f.emoji.trim() || '💋',
        pointsPerUnit: parseInt(f.pointsPerUnit, 10) || 1,
        unit: f.unit.trim() || 'adet',
        description: f.description.trim()
      };

      if (this.standardTaskModal.isEdit) {
        await updateStandardTask(this.standardTaskModal.editId, fields);
        this.showToast('Sabit görev güncellendi!');
      } else {
        await addStandardTask(fields);
        this.showToast('Yeni sabit görev eklendi!');
      }
      this.standardTaskModal.show = false;
    },
    async handleDeleteStandardTask(taskId) {
      if (confirm('Bu sabit görevi silmek istediğinize emin misiniz?')) {
        await deleteStandardTask(taskId);
        this.showToast('Sabit görev silindi.');
      }
    },

    // Ödüller
    openAddRewardModal() {
      this.rewardModal = {
        show: true,
        isEdit: false,
        editId: null,
        form: { title: '', description: '', cost: 40, emoji: '🎁', type: 'custom' }
      };
    },
    openEditRewardModal(reward) {
      this.rewardModal = {
        show: true,
        isEdit: true,
        editId: reward.id,
        form: {
          title: reward.title,
          description: reward.description,
          cost: reward.cost,
          emoji: reward.emoji,
          type: reward.type || 'custom'
        }
      };
    },
    saveRewardModal() {
      const f = this.rewardModal.form;
      if (!f.title.trim()) return alert('Ödül başlığı boş olamaz!');

      const fields = {
        title: f.title.trim(),
        description: f.description.trim(),
        cost: parseInt(f.cost, 10) || 10,
        emoji: f.emoji.trim() || '🎁',
        type: f.type
      };

      if (this.rewardModal.isEdit) {
        updateReward(this.rewardModal.editId, fields);
        this.showToast('Ödül güncellendi!');
      } else {
        addReward(fields);
        this.showToast('Yeni ödül eklendi!');
      }
      this.rewardModal.show = false;
    },
    handleDeleteReward(rewardId) {
      if (confirm('Bu ödülü silmek istediğinize emin misiniz?')) {
        removeReward(rewardId);
        this.showToast('Ödül silindi.');
      }
    },
    removeClaimedReward(idx) {
      store.acquiredRewards.splice(idx, 1);
      scheduleSave();
      this.showToast('Kullanılmış ödül kaydı silindi.');
    },

    // Şiirler
    isPoemUnlocked(poemId) {
      return store.acquiredPoems.some(p => p.id === poemId);
    },
    openAddPoemModal() {
      this.poemModal = {
        show: true,
        isEdit: false,
        editId: null,
        form: { title: '', content: '' }
      };
    },
    openEditPoemModal(poem) {
      this.poemModal = {
        show: true,
        isEdit: true,
        editId: poem.id,
        form: { title: poem.title, content: poem.content }
      };
    },
    savePoemModal() {
      const f = this.poemModal.form;
      if (!f.title.trim() || !f.content.trim()) return alert('Şiir başlığı ve içeriği boş olamaz!');

      const fields = {
        title: f.title.trim(),
        content: f.content.trim()
      };

      if (this.poemModal.isEdit) {
        updatePoem(this.poemModal.editId, fields);
        this.showToast('Şiir güncellendi!');
      } else {
        addPoem(fields);
        this.showToast('Yeni şiir eklendi!');
      }
      this.poemModal.show = false;
    },
    handleDeletePoem(poemId) {
      if (confirm('Bu şiiri silmek istediğinize emin misiniz?')) {
        removePoem(poemId);
        this.showToast('Şiir silindi.');
      }
    },

    // Cinsel Görevler
    reassignActiveIntimateTask() {
      if (!store.intimateTasks || store.intimateTasks.length === 0) return;
      const idx = Math.floor(Math.random() * store.intimateTasks.length);
      const task = store.intimateTasks[idx];
      store.activeIntimateTask = {
        ...task,
        assignedDate: new Date().toISOString().split('T')[0],
        isCompleted: false,
        completedAt: null,
        completedBy: null
      };
      scheduleSave();
      this.showToast('Bugünün zorunlu cinsel görevi değiştirildi!');
    },
    openAddIntimateModal() {
      this.intimateTaskModal = {
        show: true,
        isEdit: false,
        editId: null,
        form: { title: '', points: 30, penaltyPoints: 30, penaltyDesc: 'Ceza masajı yapılacak!' }
      };
    },
    openEditIntimateModal(task) {
      this.intimateTaskModal = {
        show: true,
        isEdit: true,
        editId: task.id,
        form: {
          title: task.title,
          points: task.points || 30,
          penaltyPoints: task.penaltyPoints || 30,
          penaltyDesc: task.penaltyDesc || ''
        }
      };
    },
    saveIntimateTaskModal() {
      const f = this.intimateTaskModal.form;
      if (!f.title.trim()) return alert('Görev başlığı boş olamaz!');

      const fields = {
        title: f.title.trim(),
        points: parseInt(f.points, 10) || 30,
        penaltyPoints: parseInt(f.penaltyPoints, 10) || 30,
        penaltyDesc: f.penaltyDesc.trim() || 'Ceza yaptırımı uygulanacak!'
      };

      if (this.intimateTaskModal.isEdit) {
        updateIntimateTask(this.intimateTaskModal.editId, fields);
        this.showToast('Cinsel görev güncellendi!');
      } else {
        addIntimateTask(fields);
        this.showToast('Yeni cinsel görev eklendi!');
      }
      this.intimateTaskModal.show = false;
    },
    handleDeleteIntimateTask(id) {
      if (confirm('Bu cinsel görevi silmek istediğinize emin misiniz?')) {
        deleteIntimateTask(id);
        this.showToast('Cinsel görev silindi.');
      }
    },

    // Taş Kağıt Makas Düello Ayarları
    handleSaveRpsSettings() {
      updateRpsSettings(this.rpsSettingsForm.penaltyPoints, this.rpsSettingsForm.penaltyDesc);
      this.showToast('Düello ceza ayarları kaydedildi!');
    },

    // Günün Fantezisi
    openAddFantasyModal() {
      this.fantasyModal = {
        show: true,
        isEdit: false,
        editId: null,
        form: { title: '', description: '', emoji: '🔥', category: 'genel' }
      };
    },
    openEditFantasyModal(fan) {
      this.fantasyModal = {
        show: true,
        isEdit: true,
        editId: fan.id,
        form: {
          title: fan.title,
          description: fan.description || '',
          emoji: fan.emoji || '🔥',
          category: fan.category || 'genel'
        }
      };
    },
    saveFantasyModal() {
      const f = this.fantasyModal.form;
      if (!f.title.trim()) return alert('Fantezi başlığı boş olamaz!');

      const fields = {
        title: f.title.trim(),
        description: f.description.trim(),
        emoji: f.emoji.trim() || '🔥',
        category: f.category || 'genel'
      };

      if (this.fantasyModal.isEdit) {
        updateFantasy(this.fantasyModal.editId, fields);
        this.showToast('Fantezi güncellendi!');
      } else {
        addFantasy(fields);
        this.showToast('Yeni fantezi eklendi!');
      }
      this.fantasyModal.show = false;
    },
    handleDeleteFantasy(id) {
      if (confirm('Bu fanteziyi silmek istediğinize emin misiniz?')) {
        deleteFantasy(id);
        this.showToast('Fantezi silindi.');
      }
    },

    // Kamasutra Çarkı Yönetimi
    openAddKamasutraModal() {
      this.kamasutraModal = {
        show: true,
        isEdit: false,
        editId: null,
        form: {
          title: '',
          emoji: '🪷',
          category: 'Romantik & Duygusal',
          difficulty: 'Orta ⭐⭐',
          description: '',
          tip: ''
        }
      };
    },
    openEditKamasutraModal(pos) {
      this.kamasutraModal = {
        show: true,
        isEdit: true,
        editId: pos.id,
        form: {
          title: pos.title,
          emoji: pos.emoji || '🪷',
          category: pos.category || 'Romantik & Duygusal',
          difficulty: pos.difficulty || 'Orta ⭐⭐',
          description: pos.description || '',
          tip: pos.tip || ''
        }
      };
    },
    saveKamasutraModal() {
      const f = this.kamasutraModal.form;
      if (!f.title.trim()) return alert('Pozisyon başlığı boş olamaz!');

      const fields = {
        title: f.title.trim(),
        emoji: f.emoji.trim() || '🪷',
        category: f.category.trim() || 'Romantik & Duygusal',
        difficulty: f.difficulty || 'Orta ⭐⭐',
        description: f.description.trim(),
        tip: f.tip.trim()
      };

      if (this.kamasutraModal.isEdit) {
        updateKamasutraPosition(this.kamasutraModal.editId, fields);
        this.showToast('Pozisyon güncellendi!');
      } else {
        addKamasutraPosition(fields);
        this.showToast('Yeni pozisyon eklendi!');
      }
      this.kamasutraModal.show = false;
    },
    handleDeleteKamasutra(id) {
      if (confirm('Bu pozisyonu silmek istediğinize emin misiniz?')) {
        deleteKamasutraPosition(id);
        this.showToast('Pozisyon silindi.');
      }
    },

    // Rol Yapma (Roleplay) Yönetimi
    openAddRoleplayModal() {
      this.roleplayModal = {
        show: true,
        isEdit: false,
        editId: null,
        form: {
          title: '',
          emoji: '🎭',
          setting: '',
          partner1Role: '',
          partner2Role: '',
          rules: '',
          description: ''
        }
      };
    },
    openEditRoleplayModal(card) {
      this.roleplayModal = {
        show: true,
        isEdit: true,
        editId: card.id,
        form: {
          title: card.title,
          emoji: card.emoji || '🎭',
          setting: card.setting || '',
          partner1Role: card.partner1Role || '',
          partner2Role: card.partner2Role || '',
          rules: card.rules || '',
          description: card.description || ''
        }
      };
    },
    saveRoleplayModal() {
      const f = this.roleplayModal.form;
      if (!f.title.trim()) return alert('Senaryo başlığı boş olamaz!');

      const fields = {
        title: f.title.trim(),
        emoji: f.emoji.trim() || '🎭',
        setting: f.setting.trim(),
        partner1Role: f.partner1Role.trim(),
        partner2Role: f.partner2Role.trim(),
        rules: f.rules.trim(),
        description: f.description.trim()
      };

      if (this.roleplayModal.isEdit) {
        updateRoleplayCard(this.roleplayModal.editId, fields);
        this.showToast('Senaryo kartı güncellendi!');
      } else {
        addRoleplayCard(fields);
        this.showToast('Yeni senaryo desteye eklendi!');
      }
      this.roleplayModal.show = false;
    },
    handleDeleteRoleplay(id) {
      if (confirm('Bu senaryo kartını silmek istediğinize emin misiniz?')) {
        deleteRoleplayCard(id);
        this.showToast('Senaryo kartı silindi.');
      }
    },

    // Kazı Kazan Kartları Yönetimi
    openAddScratchModal() {
      this.scratchModal = {
        show: true,
        isEdit: false,
        editId: null,
        form: {
          title: '',
          emoji: '🎁',
          hint: 'Kazı ve öğren...',
          content: ''
        }
      };
    },
    openEditScratchModal(card) {
      this.scratchModal = {
        show: true,
        isEdit: true,
        editId: card.id,
        form: {
          title: card.title,
          emoji: card.emoji || '🎁',
          hint: card.hint || 'Kazı ve öğren...',
          content: card.content || card.description || ''
        }
      };
    },
    saveScratchModal() {
      const f = this.scratchModal.form;
      if (!f.title.trim()) return alert('Kart başlığı boş olamaz!');

      const fields = {
        title: f.title.trim(),
        emoji: f.emoji.trim() || '🎁',
        hint: f.hint.trim() || 'Kazı ve öğren...',
        content: f.content.trim(),
        description: f.content.trim()
      };

      if (this.scratchModal.isEdit) {
        updateScratchCard(this.scratchModal.editId, fields);
        this.showToast('Kazı kazan kartı güncellendi!');
      } else {
        addScratchCard(fields);
        this.showToast('Yeni kazı kazan kartı eklendi!');
      }
      this.scratchModal.show = false;
    },
    handleDeleteScratch(id) {
      if (confirm('Bu kazı kazan kartını silmek istediğinize emin misiniz?')) {
        deleteScratchCard(id);
        this.showToast('Kazı kazan kartı silindi.');
      }
    },

    // Fabrika Ayarlarına Sıfırlama
    handleFullReset() {
      if (confirm('DİKKAT: Tüm puanlar, açılan silahlar, görevler ve şiirler sıfırlanacak. Devam edilsin mi?')) {
        resetState();
        this.showToast('Tüm sistem sıfırlandı!');
        this.$router.push('/login');
      }
    }
  }
};
</script>

<style scoped>
/* ============================================
   MODERN ADMIN DASHBOARD STYLES (NON-PIXEL)
   Okunaklı, Şık, Temiz SaaS Panel Tasarımı
   ============================================ */
.modern-admin-container {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: #1e293b;
  background: #f8fafc;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Üst Navigasyon */
.admin-navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 24px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.admin-brand {
  display: flex;
  align-items: center;
  gap: 8px;
}

.brand-badge {
  background: #6366f1;
  color: #ffffff;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  letter-spacing: 0.5px;
}

.brand-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-chip {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 6px;
}

.chip-label {
  color: #64748b;
}

.chip-val {
  color: #0f172a;
}

/* Düzen */
.admin-layout {
  display: flex;
  flex-direction: column;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  gap: 20px;
}

@media (min-width: 768px) {
  .admin-layout {
    flex-direction: row;
  }

  .admin-nav-tabs {
    width: 240px;
    flex-shrink: 0;
    flex-direction: column !important;
  }
}

/* Sol Sekmeler */
.admin-nav-tabs {
  display: flex;
  flex-direction: row;
  overflow-x: auto;
  gap: 6px;
  background: #ffffff;
  padding: 10px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.nav-tab-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.nav-tab-btn:hover {
  background: #f8fafc;
  color: #0f172a;
}

.nav-tab-btn.active {
  background: #eff6ff;
  color: #2563eb;
}

.tab-icon {
  font-size: 1.1rem;
}

.tab-text {
  flex: 1;
}

.tab-counter {
  background: #e2e8f0;
  color: #475569;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 10px;
}

.nav-tab-btn.active .tab-counter {
  background: #bfdbfe;
  color: #1d4ed8;
}

/* İçerik Alanı */
.tab-content-area {
  flex: 1;
  min-width: 0;
}

.content-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.section-desc {
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 4px;
}

/* Kartlar */
.admin-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.border-danger {
  border-color: #fecaca;
  background: #fffafa;
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.card-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
}

.bg-gold { background: #fef3c7; color: #b45309; }
.bg-danger { background: #fee2e2; color: #b91c1c; }
.bg-success { background: #dcfce7; color: #15803d; }
.bg-neutral { background: #f1f5f9; color: #475569; }

.cards-grid-2 {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 640px) {
  .cards-grid-2 {
    grid-template-columns: 1fr 1fr;
  }
}

/* Tablolar */
.table-responsive {
  overflow-x: auto;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.85rem;
}

.modern-table th {
  background: #f8fafc;
  color: #475569;
  font-weight: 600;
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
}

.modern-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #f1f5f9;
  color: #1e293b;
  vertical-align: middle;
}

.modern-table tr:hover {
  background: #fafafa;
}

.table-emoji {
  font-size: 1.6rem;
}

/* Butonlar & Inputlar */
.modern-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-primary { background: #2563eb; color: #ffffff; }
.btn-primary:hover { background: #1d4ed8; }

.btn-outline { background: #ffffff; border-color: #cbd5e1; color: #334155; }
.btn-outline:hover { background: #f8fafc; border-color: #94a3b8; }

.btn-ghost { background: transparent; color: #475569; }
.btn-ghost:hover { background: #f1f5f9; color: #0f172a; }

.btn-danger { background: #dc2626; color: #ffffff; }
.btn-danger:hover { background: #b91c1c; }

.btn-danger-outline { background: #ffffff; border-color: #fecaca; color: #dc2626; }
.btn-danger-outline:hover { background: #fee2e2; }

.btn-success { background: #16a34a; color: #ffffff; }
.btn-warning { background: #f59e0b; color: #ffffff; }

.btn-sm { padding: 6px 12px; font-size: 0.78rem; }
.btn-xs { padding: 4px 8px; font-size: 0.72rem; }

.modern-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.85rem;
  outline: none;
  transition: border-color 0.15s ease;
}

.modern-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.modern-textarea {
  resize: vertical;
  line-height: 1.5;
}

.input-xs {
  width: 70px;
  padding: 4px 8px;
  display: inline-block;
}

.form-group {
  margin-bottom: 12px;
}

.form-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 6px;
}

.quick-btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.input-action-group {
  display: flex;
  gap: 8px;
}

.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

/* Rozetler */
.badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  display: inline-block;
}

.badge-daily { background: #fce7f3; color: #be185d; }
.badge-weekly { background: #e0f2fe; color: #0369a1; }
.badge-monthly { background: #ede9fe; color: #6d28d9; }
.badge-neutral { background: #f1f5f9; color: #475569; }

.badge-danger { color: #dc2626; }
.badge-gold { color: #d97706; }

.sub-filter-tabs {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 8px;
}

.sub-filter-btn {
  padding: 6px 14px;
  border-radius: 8px;
  background: transparent;
  border: none;
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
}

.sub-filter-btn.active {
  background: #e2e8f0;
  color: #0f172a;
}

/* Şiir Önizleme Kutusu */
.poem-preview-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
  font-size: 0.82rem;
  color: #334155;
  white-space: pre-wrap;
  line-height: 1.6;
  max-height: 140px;
  overflow-y: auto;
}

.poem-admin-card .card-footer {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
}

/* Satın Alınan Ödüller Listesi */
.claimed-rewards-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0;
  margin: 0;
}

.claimed-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.ci-emoji {
  font-size: 1.5rem;
}

.ci-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.ci-date {
  font-size: 0.75rem;
  color: #94a3b8;
}

/* Modallar */
.admin-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.admin-modal {
  width: 100%;
  max-width: 480px;
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  animation: modalScale 0.2s ease-out;
}

@keyframes modalScale {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.modal-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.modal-title {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  color: #64748b;
}

.modal-body {
  padding: 20px;
  max-height: 70vh;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 20px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

/* Toast */
.admin-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: #0f172a;
  color: #ffffff;
  padding: 12px 20px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-size: 0.85rem;
  font-weight: 600;
  z-index: 2000;
}

.toast-anim-enter-active,
.toast-anim-leave-active {
  transition: all 0.25s ease;
}

.toast-anim-enter-from,
.toast-anim-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

/* Yardımcılar */
.text-danger { color: #dc2626 !important; }
.text-muted { color: #64748b !important; }
.font-bold { font-weight: 700; }
.text-right { text-align: right; }
.text-center { text-align: center; }
.text-xs { font-size: 0.72rem; }
.text-sm { font-size: 0.8rem; }
.mt-3 { margin-top: 12px; }
.mt-4 { margin-top: 16px; }
.mr-2 { margin-right: 8px; }
.p-0 { padding: 0 !important; }
.py-2 { padding-top: 8px; padding-bottom: 8px; }
.py-4 { padding-top: 16px; padding-bottom: 16px; }

.form-row-2 {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
@media (min-width: 640px) {
  .form-row-2 {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
