<template>
  <div class="max-w-4xl mx-auto p-6 font-sans text-gray-800">
    
    <header class="flex justify-end mb-6">
      <button 
        @click="logout" 
        class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all text-sm shadow-sm active:scale-95"
      >
        Se déconnecter
      </button>
    </header>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      
      <div 
        class="flex items-center justify-between mb-6 cursor-pointer select-none group" 
        @click="showDisks = !showDisks"
      >
        <h2 class="flex items-center gap-3 text-2xl font-bold">
          <Icon 
            icon="clarity:hard-disk-solid-badged" 
            width="40" 
            class="text-blue-600"
          />
          <span class="text-black">Disques</span>
        </h2>
        <Icon 
          :icon="showDisks ? 'mdi:chevron-up' : 'mdi:chevron-down'" 
          width="28" 
          class="text-gray-400 group-hover:text-blue-500 transition-colors"
        />
      </div>

      <div v-show="showDisks" class="space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
        <div v-if="filteredDisks.length" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            v-for="(disk, index) in filteredDisks" 
            :key="index" 
            @click="handleDiskClick(disk)"
            class="cursor-pointer group bg-gray-50 border rounded-xl p-5 transition-all"
            :class="selectionedDisk === disk._mounted ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 hover:bg-white hover:shadow-md'"
          >
            <div class="flex items-center gap-3 mb-4">
              <Icon 
                icon="icon-park-solid:data" 
                width="28" 
                class="text-blue-600"
              />
              <span class="font-bold truncate text-gray-700">{{ disk._mounted }}</span>
            </div>
            
            <div class="flex justify-between items-center text-sm text-gray-500 mb-2 font-medium">
              <span>{{ formatGB(disk._used) }} Go / {{ formatGB(disk._blocks) }} Go</span>
              <span class="bg-white px-2 py-0.5 rounded border border-gray-100 text-xs shadow-sm">{{ disk._capacity }}</span>
            </div>

            <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                class="bg-blue-500 h-2 rounded-full transition-all duration-700" 
                :style="{ width: disk._capacity }"
              ></div>
            </div>
          </div>
        </div>
        
        <div v-if="filesList && filesList.length" class="pt-6 border-t border-gray-100">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2 font-bold text-gray-700">
              <Icon icon="material-symbols:folder-open" width="24" class="text-blue-600" />
              <h3>Racine : {{ selectionedDisk }}</h3>
            </div>
            <button @click="filesList = []" class="text-gray-300 hover:text-red-500 transition-colors">
              <Icon icon="mdi:close" width="20" />
            </button>
          </div>
          
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            <div 
              v-for="(file, index) in filesList" 
              :key="index"
              @click="openFile(file)"
              @contextmenu.prevent="openContextMenu($event, file, false)"
              @touchstart="onTouchStartMenu($event, file, false)"
              @touchend="onTouchEndMenu"
              class="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50 text-sm transition-all cursor-pointer group border border-transparent select-none active:scale-95"
              :class="fileSelected === (file.name || file) ? 'bg-blue-50 text-blue-700 border-blue-100' : 'text-gray-600'"
            >
              <Icon icon="ic:baseline-folder" class="shrink-0 text-blue-500 group-hover:scale-110 transition-transform" width="22" />
              <span class="truncate font-medium">{{ file.name || file }}</span>
            </div>
          </div>
        </div>

        <div v-if="subFilesList && subFilesList.length" class="pt-6 border-t-2 border-blue-100 bg-blue-50/30 p-4 rounded-xl">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2 text-gray-900 font-bold">
              <Icon icon="material-symbols:folder-special" width="24" class="text-blue-600" />
              <h3 class="truncate">{{ fileSelected }}</h3>
            </div>
            <button @click="subFilesList = []" class="text-red-400 hover:text-red-600 transition-colors">
              <Icon icon="mdi:close-box" width="24" />
            </button>
          </div>
       
            <div
              class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 flex-1 overflow-y-auto"
              ref="gridContainer"
            >
           <div
              v-for="(item, index) in subFilesList"
              :key="index"
              @click="openFile(item, true)"
              @contextmenu.prevent="openContextMenu($event, item, false)"
              @touchstart="onTouchStartMenu($event, item, false)"
              @touchend="onTouchEndMenu"
              class="flex items-center transition-all select-none active:scale-95 overflow-hidden border border-gray-100 rounded-lg bg-white shadow-sm group hover:border-blue-400"
              :class="isImage(item.name || item) && thumbnailsUrls[item.name || item] ? 'p-0' : 'p-3 gap-2'"
            >
              <!-- Pour les images -->
              <div
                v-if="isImage(item.name || item)"
                class="w-full aspect-square overflow-hidden"
              >
                <img
                  v-if="thumbnailsUrls[item.name || item]"
                  :src="thumbnailsUrls[item.name || item]"
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  @load="markThumbnailAsLoaded(item.name || item)"
                />
                <div v-else class="w-full h-full flex items-center justify-center bg-gray-50">
                  <Icon
                    icon="mdi:loading"
                    class="animate-spin text-blue-400"
                    width="20"
                  />
                </div>
              </div>

              <!-- Pour les autres types -->
              <div
                v-else
                class="w-10 h-10 shrink-0 flex items-center justify-center rounded bg-gray-50 border border-gray-100"
              >
                <div v-if="isVideo(item.name || item)" class="w-full h-full flex items-center justify-center bg-gray-800 rounded">
                  <Icon icon="mdi:play-circle" width="24" class="text-white opacity-90" />
                </div>
                <Icon
                  v-else
                  :icon="isFile(item.name || item) ? 'vscode-icons:default-file' : 'ic:baseline-folder'"
                  width="22"
                  class="group-hover:rotate-12 transition-transform"
                  :class="!isFile(item.name || item) ? 'text-blue-500' : ''"
                />
              </div>

              <span
                v-if="!(isImage(item.name || item) && thumbnailsUrls[item.name || item])"
                class="truncate font-medium flex-1 text-sm text-gray-600"
              >
                {{ item.name || item }}
              </span>
            </div>
            </div>
        </div>
      </div>
<!-- Context Menu -->
      <div 
        v-if="contextMenu.show" 
        class="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        @click="closeContextMenu"
      >
        <div 
          class="bg-white rounded-2xl shadow-2xl w-80 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
          @click.stop
        >
          <div class="px-5 py-4 bg-gray-50 border-b border-gray-100">
            <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Élément sélectionné</p>
            <p class="text-sm font-bold text-blue-700 truncate">{{ contextMenu.item?.name || contextMenu.item }}</p>
          </div>

          <!-- Modal import / telechargement -->
          <div class="p-2 space-y-1">
            <button 
              @click="handleGlobalDownload"
              class="w-full text-left px-4 py-3 hover:bg-blue-50 text-gray-700 rounded-xl flex items-center gap-4 transition-colors group"
            >
              <div class="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-600 transition-colors">
                <Icon 
                  :icon="isFile(contextMenu.item?.name || contextMenu.item) ? 'mdi:file-download' : 'mdi:folder-zip'" 
                  width="20" 
                  class="text-blue-600 group-hover:text-white" 
                />
              </div>
              <div>
                <p class="font-bold text-sm text-gray-800">Télécharger</p>
                <p class="text-[10px] text-gray-400 font-medium">
                  {{ isFile(contextMenu.item?.name || contextMenu.item) ? 'Fichier brut' : 'Archive compressée (.zip)' }}
                </p>
              </div>
            </button>

            <button 
              @click="actionImport"
              class="w-full text-left px-4 py-3 hover:bg-emerald-50 text-gray-700 rounded-xl flex items-center gap-4 transition-colors group"
            >
              <div class="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-600 transition-colors">
                <Icon icon="mdi:file-upload" width="20" class="text-emerald-600 group-hover:text-white" />
              </div>
              <div>
                <p class="font-bold text-sm text-gray-800">Importer un fichier</p>
                <p class="text-[10px] text-gray-400 font-medium">Ajouter des fichiers à ce répertoire</p>
              </div>
            </button>
              <button 
              @click="actionImportFolder"
              class="w-full text-left px-4 py-3 hover:bg-emerald-50 text-gray-700 rounded-xl flex items-center gap-4 transition-colors group"
            >
              <div class="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-600 transition-colors">
                <Icon icon="mdi:file-upload" width="20" class="text-emerald-600 group-hover:text-white" />
              </div>
              <div>
                <p class="font-bold text-sm text-gray-800">Importer un dossier</p>
                <p class="text-[10px] text-gray-400 font-medium">Ajouter un dossier à ce répertoire</p>
              </div>
            </button>

            <div class="pt-2">
              <button 
                @click="closeContextMenu" 
                class="w-full py-3 text-red-500 font-black text-xs uppercase tracking-tighter hover:bg-red-50 rounded-xl transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>

      <input type="file" ref="fileInput" multiple class="hidden"
       @change="handleFileUpload" 
        webkitdirectory  
        mozdirectory 
       />
    </div>

    <div 
      v-if="previewMedia.url" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md"
      @click="closeMedia"
    >
      <div 
        ref="mediaContainer" 
        class="relative flex items-center justify-center w-full h-full max-w-7xl max-h-screen p-4 group" 
        @click.stop
        @touchstart="handleTouchStart"
        @touchend="handleTouchEnd"
      >
        <div class="absolute top-4 left-0 right-0 px-6 flex justify-between items-center transition-opacity z-20">
          <div class="bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold border border-white/10">
            {{ currentMediaIndex + 1 }} / {{ currentMediaList.length }}
          </div>
          <div class="flex gap-4 bg-black/60 backdrop-blur-md p-2 rounded-2xl border border-white/10">
            <button @click.stop="toggleFullscreen" class="text-white hover:text-blue-400 transition-colors" title="Plein écran">
              <Icon icon="mdi:fullscreen" width="30" />
            </button>
            <button @click.stop="closeMedia" class="text-white hover:text-red-500 transition-colors" title="Fermer">
              <Icon icon="mdi:close-circle" width="30" />
            </button>
          </div>
        </div>

        <button 
          v-if="currentMediaIndex > 0"
          @click.stop="prevMedia"
          class="absolute left-6 top-1/2 -translate-y-1/2 bg-transparent  hover:transform hover:scale-110   text-white p-4 rounded-full transition-all z-20"
        >
          <Icon icon="mdi:chevron-left" width="36" />
        </button>

        <img 
          v-if="previewMedia.type === 'image'" 
          :src="previewMedia.url" 
          class="max-w-full max-h-full object-contain rounded-lg shadow-2xl select-none animate-in fade-in zoom-in-95 duration-300" 
          draggable="false"
        />

        <video 
          v-else-if="previewMedia.type === 'video'" 
          :src="previewMedia.url" 
          controls 
          autoplay
          class="max-w-full max-h-full rounded-lg shadow-2xl outline-none"
        ></video>

        <button 
          v-if="currentMediaIndex < currentMediaList.length - 1"
          @click.stop="nextMedia"
          class="absolute right-6 top-1/2 -translate-y-1/2 bg-transparent  hover:transform hover:scale-110  text-white p-4 rounded-full transition-all z-20"
        >
          <Icon icon="mdi:chevron-right" width="36" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router'; 
import { useAuthStore } from '@/stores/auth.store';
import { useDiskStore } from '@/stores/disk.store';
import { Icon } from '@iconify/vue';
import { toast } from 'vue3-toastify';

// --- STORES & ROUTER ---
const router = useRouter();
const authStore = useAuthStore();
const diskStore = useDiskStore();

// --- STATES ---
const diskUtil = ref([]);
const showDisks = ref(false);
const osMachine = ref('');
const selectionedDisk = ref(null);
const filesList = ref([]);
const fileSelected = ref(null);
const subFilesList = ref([]);
const previewMedia = ref({ type: null, url: null });
const mediaContainer = ref(null);
const currentMediaList = ref([]);
const currentMediaIndex = ref(-1);
const isMediaSubLevel = ref(false);
const thumbnailsUrls = ref({});
const THUMBNAILS_BATCH_SIZE = 14;
const loadedThumbnails = ref(new Set());
const visibleRange = ref({ start: 0, end: THUMBNAILS_BATCH_SIZE });
const gridContainer = ref(null);
const actualPath = ref(null);



const markThumbnailAsLoaded = (fileName) => {
  loadedThumbnails.value.add(fileName);
};


const fileInput = ref(null);
const contextMenu = ref({ show: false, item: null, isSubLevel: false });
let longPressTimer = null;

// Variables pour le swipe
let touchStartX = 0;
let touchEndX = 0;

// --- HELPERS ---
const isImage = (name) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name);
const isVideo = (name) => /\.(mp4|webm|ogg|mov|mkv)$/i.test(name);
const isFile = (name) => {
  const fileName = typeof name === 'object' ? name.name : name;
  return /\.[a-zA-Z0-9]+$/.test(fileName);
};

// Fonction pour charger les miniatures dans la plage visible
const loadVisibleThumbnails = async () => {
  const imageItems = subFilesList.value.filter(item => isImage(item.name || item));

  for (let i = visibleRange.value.start; i < visibleRange.value.end && i < imageItems.length; i++) {
    const item = imageItems[i];
    const fileName = item.name || item;

    if (!thumbnailsUrls.value[fileName] && !loadedThumbnails.value.has(fileName)) {
      try {
        let pathToSend = fileSelected.value ? `${fileSelected.value}/${fileName}` : fileName;
        const blob = await diskStore.getMediaFile(selectionedDisk.value, pathToSend);
        thumbnailsUrls.value[fileName] = URL.createObjectURL(blob);
      } catch (e) {
        console.error("Erreur miniature:", fileName);
      }
    }
  }
};


const handleScroll = () => {
  const scrollPosition = gridContainer.value;
  
  if (!scrollPosition) return;

  const scrollTop = scrollPosition.scrollTop;
  const scrollHeight = scrollPosition.scrollHeight;
  const clientHeight = scrollPosition.clientHeight;
  const threshold = 1;
  const imageItems = subFilesList.value.filter(item => isImage(item.name || item));

  if (scrollHeight - (scrollTop + clientHeight) < threshold) {
    if (visibleRange.value.end < imageItems.length) {
      console.log('Chargement du lot suivant...');
      visibleRange.value.start = visibleRange.value.end;
      visibleRange.value.end = Math.min(
        visibleRange.value.end + THUMBNAILS_BATCH_SIZE,
        imageItems.length
      );
      loadVisibleThumbnails();
    }
  }
};


// --- GESTION DU MENU D'ACTIONS (Context Menu) ---
const openContextMenu = (e, item, isSubLevel) => {
  e.preventDefault();
  contextMenu.value = { show: true, item, isSubLevel };
};

const closeContextMenu = () => { contextMenu.value.show = false; };

const onTouchStartMenu = (e, item, isSubLevel) => {
  longPressTimer = setTimeout(() => openContextMenu(e, item, isSubLevel), 600);
};

const onTouchEndMenu = () => clearTimeout(longPressTimer);

// --- TÉLÉCHARGEMENT (Fichier & Dossier) ---
const handleGlobalDownload = async () => {
  const { item, isSubLevel } = contextMenu.value;
  const name = item?.name || item;
  const pathToSend = actualPath.value || (isSubLevel && fileSelected.value) ? `${fileSelected.value}/${name}` : name;
  const isFileItem = isFile(name);

  closeContextMenu();
  const idToast = toast.loading(isFileItem ? `Téléchargement de ${name}...` : `Préparation du ZIP de ${name}...`);

  try {
    let blob;
    let extension = '';

    if (isFileItem) {
      blob = await diskStore.getMediaFile(selectionedDisk.value, pathToSend);
    } else {
      // Appel vers une route de compression côté backend
      blob = await diskStore.downloadFolderAsZip(selectionedDisk.value, pathToSend);
      extension = '.zip';
    }

    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', isFileItem ? name : `${name}${extension}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    toast.update(idToast, { render: "Succès !", type: "success", isLoading: false, autoClose: 2000 });
  } catch (error) {
    console.error(error);
    toast.update(idToast, { render: "Échec du téléchargement", type: "error", isLoading: false, autoClose: 3000 });
  }
};

// --- IMPORTATION ---
const actionImport = () => {
  closeContextMenu();
  // Réinitialiser l'attribut webkitdirectory pour forcer le mode fichier
  fileInput.value.removeAttribute('webkitdirectory');
  fileInput.value.removeAttribute('mozdirectory');
  fileInput.value.click();
};

const actionImportFolder = () => {
  closeContextMenu();
  // Activer l'attribut webkitdirectory pour le mode dossier
  fileInput.value.setAttribute('webkitdirectory', '');
  fileInput.value.setAttribute('mozdirectory', '');
  fileInput.value.click();
};

const handleFileUpload = async (event) => {
  const files = event.target.files;
  if (!files.length) return;

  const currentPath = fileSelected.value || '';
  const formData = new FormData();
  Array.from(files).forEach(f => formData.append('files', f));

  const idToast = toast.loading(`Envoi de ${files.length} fichier(s)...`);

  try {
    await diskStore.uploadFiles(selectionedDisk.value, currentPath, formData);
    toast.update(idToast, { render: "Importation terminée", type: "success", isLoading: false, autoClose: 2000 });
    
    // Refresh
    if (currentPath) {
      subFilesList.value = await diskStore.getFileContenu(selectionedDisk.value, currentPath);
    } else {
      filesList.value = await diskStore.getFiles(selectionedDisk.value);
    }
  } catch (error) {
    toast.update(idToast, { render: "Erreur lors de l'envoi", type: "error", isLoading: false, autoClose: 3000 });
  } finally {
    event.target.value = '';
  }
};

// --- NAVIGATION & RÉPERTOIRES ---
async function handleDiskClick(disk) {
  selectionedDisk.value = disk._mounted;
  filesList.value = []; subFilesList.value = []; fileSelected.value = null;
  try {
    filesList.value = await diskStore.getFiles(selectionedDisk.value);
  } catch (err) {
    toast.error('Accès disque impossible');
  }
}

async function openFile(file, isSubLevel = false) {
  const fileName = file.name || file;
  let pathToSend = (isSubLevel && fileSelected.value) ? `${fileSelected.value}/${fileName}` : fileName;

  actualPath.value = pathToSend;

  if (isImage(fileName) || isVideo(fileName)) {
    const list = isSubLevel ? subFilesList.value : filesList.value;
    currentMediaList.value = list.filter(f => isImage(f.name || f) || isVideo(f.name || f));
    currentMediaIndex.value = currentMediaList.value.findIndex(f => (f.name || f) === fileName);
    isMediaSubLevel.value = isSubLevel;
    await loadMediaObject(fileName, isSubLevel);
    return;
  }

 if (isFile(fileName)) return;

  fileSelected.value = pathToSend;
  try {
    const response = await diskStore.getFileContenu(selectionedDisk.value, pathToSend);
    subFilesList.value = response || [];


    // Réinitialise le chargement des miniatures
    loadedThumbnails.value.clear();
    thumbnailsUrls.value = {};
    visibleRange.value = { start: 0, end: THUMBNAILS_BATCH_SIZE };

    // Charge les premières miniatures
    await loadVisibleThumbnails();
  } catch (error) {
    toast.error('Erreur lecture dossier');
  }
}

const loadMediaObject = async (fileName, isSub) => {
  try {
    let pathToSend = (isSub && fileSelected.value) ? `${fileSelected.value}/${fileName}` : fileName;
    if (previewMedia.value.url?.startsWith('blob:')) URL.revokeObjectURL(previewMedia.value.url);

    const blob = await diskStore.getMediaFile(selectionedDisk.value, pathToSend);
    previewMedia.value = {
      type: isImage(fileName) ? 'image' : 'video',
      url: URL.createObjectURL(blob)
    };
  } catch (e) {
    toast.error('Erreur de chargement média');
  }
};

// --- UTILS & SYSTÈME ---
const detectOS = (disks) => {
  if (!disks?.length) return 'linux'; 
  if (disks.some(d => /^[a-zA-Z]:/.test(d._mounted))) return 'windows';
  if (disks.some(d => d._mounted.includes('/System/Volumes'))) return 'mac';
  if (disks.some(d => d._mounted === '/run')) return 'linux'; 
  return 'linux';
};

const filteredDisks = computed(() => {
  return diskUtil.value.filter(disk => {
    const mount = disk._mounted;
    if (osMachine.value === 'windows') return /^[a-zA-Z]:/.test(mount) && !/^C:\\?$/.test(mount.toUpperCase());
    if (osMachine.value === 'mac') return mount === '/System/Volumes/Data' || mount.startsWith('/Volumes/');
    if(osMachine.value === 'linux') return mount === '/' || mount.startsWith('/mnt');
    return mount.startsWith('/media/') || mount.startsWith('/mnt/');
  });
});

const formatGB = (value) => {
  if (!value) return '0.00';
  const factor = osMachine.value === 'mac' ? 1000000000 : 1073741824;
  const unit = osMachine.value === 'mac' ? 512 : (osMachine.value === 'linux' ? 1024 : 1);
  return ((value * unit) / factor).toFixed(2);
};

const nextMedia = () => {
  if (currentMediaIndex.value < currentMediaList.value.length - 1) {
    currentMediaIndex.value++;
    const next = currentMediaList.value[currentMediaIndex.value];
    loadMediaObject(next.name || next, isMediaSubLevel.value);
  }
};

const prevMedia = () => {
  if (currentMediaIndex.value > 0) {
    currentMediaIndex.value--;
    const prev = currentMediaList.value[currentMediaIndex.value];
    loadMediaObject(prev.name || prev, isMediaSubLevel.value);
  }
};

const handleTouchStart = (e) => touchStartX = e.changedTouches[0].screenX;
const handleTouchEnd = (e) => {
  touchEndX = e.changedTouches[0].screenX;
  const dist = touchStartX - touchEndX;
  if (dist > 70) nextMedia();
  else if (dist < -70) prevMedia();
};

const toggleFullscreen = async () => {
  if (!document.fullscreenElement) await mediaContainer.value?.requestFullscreen();
  else await document.exitFullscreen();
};

const closeMedia = async () => {
  if (document.fullscreenElement) await document.exitFullscreen();
  if (previewMedia.value.url?.startsWith('blob:')) URL.revokeObjectURL(previewMedia.value.url);
  previewMedia.value = { type: null, url: null };
};

async function logout() {
  await authStore.logout();
  router.push('/');
}

onMounted(async () => {
  try {
    const data = await diskStore.fetchDiskUtile();
    diskUtil.value = data;
    osMachine.value = detectOS(data);
  } catch (e) {
    toast.error('Cloud hors ligne');
  }
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
})

</script>

<style scoped>
.animate-in {
  animation: animate-in 0.3s ease-out;
}
@keyframes animate-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>