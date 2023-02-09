import TrackPlayer from 'react-native-track-player';

export const QueueInitialTracksService = async (): Promise<void> => {
  await TrackPlayer.add([
    {
      id: 1,
      url: 'http://bfmstream.bfm.ru:8004/fm64',
      title: 'Бизнес FM 64 кбит',
    },
    {
      id: 2,
      url: 'http://bfmstream.bfm.ru:8004/fm32',
      title: 'Бизнес FM 32 кбит',
    },
  ]);
};
