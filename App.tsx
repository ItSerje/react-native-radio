import React, {useEffect, useState} from 'react';
import TrackPlayer, {
  Event,
  State,
  Track,
  usePlaybackState,
  useTrackPlayerEvents,
} from 'react-native-track-player';
import {QueueInitialTracksService, SetupService} from './services';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';

const buffer = 2.5;

const App = () => {
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [queue, setQueue] = useState<Track[]>([]);
  const [info, setInfo] = useState<Track | null>(null);

  const playerState = usePlaybackState();

  const setup = async () => {
    setIsPlayerReady(false);
    let isSetup = await SetupService();

    const queue = await TrackPlayer.getQueue();
    if (isSetup && queue.length <= 0) {
      await QueueInitialTracksService();
    }

    setIsPlayerReady(isSetup);
  };

  const loadPlaylist = async () => {
    const queue = await TrackPlayer.getQueue();
    setQueue(queue);
  };

  const setTrackInfo = async () => {
    try {
      const track = await TrackPlayer.getCurrentTrack();
      if (track !== null) {
        const info = await TrackPlayer.getTrack(track);
        setInfo(info);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const seekToEndMinusBuffer = async (buffer: number) => {
    const bufferedPosition = await TrackPlayer.getBufferedPosition();
    if (bufferedPosition - buffer > buffer) {
      await TrackPlayer.seekTo(bufferedPosition - buffer);
    } else {
      await TrackPlayer.seekTo(bufferedPosition);
    }
  };

  const handlePlayPress = async () => {
    if ((await TrackPlayer.getState()) == State.Playing) {
      TrackPlayer.pause();
    } else {
      const current = await TrackPlayer.getCurrentTrack();
      if (current) {
        await TrackPlayer.skip(current);
      }
      await TrackPlayer.play();
      await seekToEndMinusBuffer(buffer);
    }
  };

  useEffect(() => {
    setup();
  }, []);

  useEffect(() => {
    if (isPlayerReady) {
      loadPlaylist();
    }
  }, [isPlayerReady]);

  useEffect(() => {
    setTrackInfo();
  }, [isPlayerReady]);

  useTrackPlayerEvents([Event.PlaybackTrackChanged], _event => {
    setTrackInfo();
  });

  if (!isPlayerReady) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#bbb" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.text}>{info?.title || '???????????? FM'}</Text>
      </View>
      <View style={styles.row}>
        <TouchableOpacity style={styles.btn} onPress={handlePlayPress}>
          <Text style={styles.text}>
            {playerState == State.Playing ? 'Pause' : 'Play'}
          </Text>
        </TouchableOpacity>
      </View>
      {queue.length > 0 && (
        <View style={styles.row}>
          {queue.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.station}
              onPress={() => TrackPlayer.skip(index)}>
              <Text style={styles.text}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'black',
    padding: 10,
  },
  row: {
    marginBottom: 30,
  },
  btn: {
    backgroundColor: 'limegreen',
    padding: 15,
    borderRadius: 10,
    margin: 10,
    width: 150,
  },
  text: {
    fontSize: 30,
    color: 'white',
    textAlign: 'center',
  },
  station: {
    marginBottom: 30,
    padding: 15,
    borderRadius: 10,
    backgroundColor: 'gray',
    width: 320,
  },
});

export default App;
