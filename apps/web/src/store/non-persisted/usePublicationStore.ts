import type { AnyPublication } from '@lensshare/lens';
import type { NewAttachment } from '@lensshare/types/misc';
import type { MetadataLicenseType } from '@lens-protocol/metadata';

import { create } from 'zustand';
import { createTrackedSelector } from 'react-tracked';

interface PublicationState {
  addAttachments: (attachments: NewAttachment[]) => void;
  attachments: NewAttachment[];
  audioPublication: {
    artist: string;
    cover: string;
    coverMimeType: string;
    title: string;
  };
  isUploading: boolean;
  license: MetadataLicenseType | null;
  liveVideoConfig: {
    id: string;
    playbackId: string;
    streamKey: string;
  };
  pollConfig: {
    length: number;
    options: string[];
  };
  resetPollConfig: () => void;
  setPollConfig: (pollConfig: { length: number; options: string[] }) => void;
  setShowPollEditor: (showPollEditor: boolean) => void;
  showPollEditor: boolean;
  marketConfig: {
    creator : string;
    question: string;
    outcomes: string[];
    endTime: number; // Assuming UNIX timestamp
  };
  publicationContent: string;
  quotedPublication: AnyPublication | null;
  removeAttachments: (ids: string[]) => void;
  resetLiveVideoConfig: () => void;

  resetMarketConfig: () => void;
  setAttachments: (attachments: NewAttachment[]) => void;
  setAudioPublication: (audioPublication: {
    artist: string;
    cover: string;
    coverMimeType: string;
    title: string;
  }) => void;
  setIsUploading: (isUploading: boolean) => void;
  setLicense: (license: MetadataLicenseType | null) => void;
  setLiveVideoConfig: (liveVideoConfig: {
    id: string;
    playbackId: string;
    streamKey: string;
  }) => void;
  setMarketConfig: (marketConfig: {
    creator : string;
    question: string;
    outcomes: string[];
    endTime: number; // Assuming UNIX timestamp
  }) => void;

  setPublicationContent: (publicationContent: string) => void;
  setQuotedPublication: (quotedPublication: AnyPublication | null) => void;
  setShowLiveVideoEditor: (showLiveVideoEditor: boolean) => void;

  setShowMarketEditor: (showMarketEditor: boolean) => void;
  setUploadedPercentage: (uploadedPercentage: number) => void;
  setVideoDurationInSeconds: (videoDurationInSeconds: string) => void;
  setVideoThumbnail: (videoThumbnail: {
    type?: string;
    uploading?: boolean;
    url?: string;
  }) => void;
  showLiveVideoEditor: boolean;

  showMarketEditor: boolean;
  updateAttachments: (attachments: NewAttachment[]) => void;
  uploadedPercentage: number;
  videoDurationInSeconds: string;
  videoThumbnail: {
    type?: string;
    uploading?: boolean;
    url?: string;
  };
}

const store = create<PublicationState>((set) => ({
  addAttachments: (newAttachments) =>
    set((state) => {
      return { attachments: [...state.attachments, ...newAttachments] };
    }),
  attachments: [],
  audioPublication: {
    artist: '',
    cover: '',
    coverMimeType: 'image/jpeg',
    title: ''
  },
  isUploading: false,
  license: null,
  liveVideoConfig: { id: '', playbackId: '', streamKey: '' },
  pollConfig: { length: 7, options: ['', ''] },
  resetPollConfig: () =>
    set(() => ({ pollConfig: { length: 1, options: ['', ''] } })),
  setPollConfig: (pollConfig) => set(() => ({ pollConfig })),
  setShowPollEditor: (showPollEditor) => set(() => ({ showPollEditor })),
  showPollEditor: false,
  publicationContent: '',
  quotedPublication: null,
  marketConfig: {creator: '', question: '', outcomes: [], endTime: Date.now() / 1000 }, // Default values
  removeAttachments: (ids) =>
    set((state) => {
      const attachments = [...state.attachments];
      ids.map((id) => {
        const index = attachments.findIndex((a) => a.id === id);
        if (index !== -1) {
          attachments.splice(index, 1);
        }
      });
      return { attachments };
    }),
  resetLiveVideoConfig: () =>
    set(() => ({ liveVideoConfig: { id: '', playbackId: '', streamKey: '' } })),
  resetMarketConfig: () =>
    set(() => ({
      marketConfig: {
        creator: '',
        question: '',
        outcomes: [],
        endTime: Date.now() / 1000 // Reset to current time
      }
    })),
  setAttachments: (attachments) => set(() => ({ attachments })),
  setAudioPublication: (audioPublication) => set(() => ({ audioPublication })),
  setIsUploading: (isUploading) => set(() => ({ isUploading })),
  setLicense: (license) => set(() => ({ license })),
  setLiveVideoConfig: (liveVideoConfig) => set(() => ({ liveVideoConfig })),
  setMarketConfig: (marketConfig) => set(() => ({ marketConfig })),
  setPublicationContent: (publicationContent) =>
    set(() => ({ publicationContent })),
  setQuotedPublication: (quotedPublication) =>
    set(() => ({ quotedPublication })),
  setShowLiveVideoEditor: (showLiveVideoEditor) =>
    set(() => ({ showLiveVideoEditor })),
  setShowMarketEditor: (showMarketEditor) => set(() => ({ showMarketEditor })),
  setUploadedPercentage: (uploadedPercentage) =>
    set(() => ({ uploadedPercentage })),
  setVideoDurationInSeconds: (videoDurationInSeconds) =>
    set(() => ({ videoDurationInSeconds })),
  setVideoThumbnail: (videoThumbnail) => set(() => ({ videoThumbnail })),
  showLiveVideoEditor: false,
  showMarketEditor: false,
  updateAttachments: (updateAttachments) =>
    set((state) => {
      const attachments = [...state.attachments];
      updateAttachments.map((attachment) => {
        const index = attachments.findIndex((a) => a.id === attachment.id);
        if (index !== -1) {
          attachments[index] = attachment;
        }
      });
      return { attachments };
    }),
  uploadedPercentage: 0,
  videoDurationInSeconds: '',
  videoThumbnail: { type: '', uploading: false, url: '' }
}));

export const usePublicationStore = createTrackedSelector(store);
