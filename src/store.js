import { create } from 'zustand';

export const useStore = create((set) => ({
  isAdmin: false,
  roomId: '',
  userName: '',
  localPeerId: '',
  participants: [],
  streams: [],
  setRoomId: (id) => set({ roomId: id }),
  setIsAdmin: (flag) => set({ isAdmin: flag }),
  setUserName: (name) => set({ userName: name }),
  setLocalPeerId: (id) => set({ localPeerId: id }),
  addParticipant: (participant) => set((state) => ({
    participants: state.participants.some(p => p.id === participant.id) 
      ? state.participants 
      : [...state.participants, participant]
  })),
  removeParticipant: (id) => set((state) => ({
    participants: state.participants.filter(p => p.id !== id)
  })),
  addStream: (stream) => set((state) => ({
    streams: state.streams.some(s => s.id === stream.id)
      ? state.streams
      : [...state.streams, stream]
  })),
  reset: () => set({
    isAdmin: false,
    roomId: '',
    userName: '',
    participants: [],
    localPeerId: '',
    streams: []
  })
}));