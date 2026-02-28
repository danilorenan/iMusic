import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Track } from '../../types';
import { DownloadCloud, MoreVertical } from 'lucide-react-native';
import { AudioPipeline } from '../../core/player/AudioPipeline';
import { useDownloadManagerStore } from '../../store/DownloadManagerStore';
import { useUIStore } from '../../store/UIStore';

interface Props {
    track: Track;
    index: number;
}

export const TrackListItem = ({ track, index }: Props) => {
    const { activeDownloads, addTrackToDownload } = useDownloadManagerStore();
    const { isOfflineMode } = useUIStore();

    const downloadStatus = activeDownloads[track.id];
    const isDownloading = downloadStatus?.status === 'downloading';
    const progressText = (downloadStatus?.progress || 0) * 100;

    const handlePlay = () => {
        // Pode não ter clique se tiver offline sem a música, tratar aqui ou via UI opacidade
        AudioPipeline.playTrack(track);
    };

    return (
        <TouchableOpacity 
      activeOpacity= { 0.7}
    onPress = { handlePlay }
    className = {`flex-row items-center justify-between py-3 px-4 ${isOfflineMode ? 'opacity-60' : 'opacity-100'}`
}
    >
    <View className="flex-row items-center flex-1" >
        {/* Artwork */ }
        < Image
source = {{ uri: track.artwork_url || 'https://via.placeholder.com/150' }}
className = "w-14 h-14 rounded-md bg-nova-surface items-center justify-center mr-3"
    />

    {/* Track Info */ }
    < View className = "flex-1 justify-center mr-4" >
        <Text className="text-white text-base font-semibold" numberOfLines = { 1} >
            { track.title }
            </Text>
            < Text className = "text-nova-textSecondary text-sm" numberOfLines = { 1} >
                { track.artist }
                </Text>
                </View>
                </View>

{/* Actions */ }
<View className="flex-row items-center space-x-4" >
    {
        isDownloading?(
          <Text className = "text-nova-accent text-xs font-bold" > { progressText.toFixed(0) } % </Text>
        ): (
                <TouchableOpacity onPress = { () => addTrackToDownload(track) } disabled = { isOfflineMode }>
            <DownloadCloud size = { 22 } color = { isOfflineMode? '#555': '#B3B3B3' } />
    </TouchableOpacity>
        )}
<TouchableOpacity>
    <MoreVertical size={ 20 } color = "#B3B3B3" />
        </TouchableOpacity>
        </View>
        </TouchableOpacity>
  );
};
