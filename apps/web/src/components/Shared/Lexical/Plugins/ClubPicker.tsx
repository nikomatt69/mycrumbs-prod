import type { ClubProfile } from '@lensshare/types/club';
import type { FC } from 'react';

import { Image } from '@lensshare/ui';
import cn from '@lensshare/ui/cn';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  useBasicTypeaheadTriggerMatch
} from '@lexical/react/LexicalTypeaheadMenuPlugin';

import { TextNode } from 'lexical';
import { useState, useCallback, useMemo } from 'react';
import useClubQuery from 'src/hooks/useClubQuery';
import { $createMentionNode } from '../Nodes/MentionsNode';


class ClubOption extends MenuOption {
  club: ClubProfile;
  
  constructor(club: ClubProfile) {
    super(club.handle);
    this.club = club;
  }
}

function ClubMenuItem({ club, index, isSelected, onClick }: {
  club: ClubProfile;
  index: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className={cn(
        "m-1.5 flex cursor-pointer items-center space-x-2 rounded-lg px-3 py-1 dark:text-white",
        isSelected && "bg-gray-100 dark:bg-gray-800"
      )}
      onClick={onClick}
      aria-selected={isSelected}
      role="option"
    >
      <Image
        alt={club.handle}
        className="size-7 rounded-full border bg-gray-200 dark:border-gray-700"
        height="28"
        src={club.picture}
        width="28"
      />
      <div className="flex flex-col truncate">
        <span>{club.name}</span>
        <span className="text-xs">{club.handle}</span>
      </div>
    </div>
  );
}

const ClubPickerPlugin: FC = () => {
  const [editor] = useLexicalComposerContext();
  const [queryString, setQueryString] = useState<string>('');
  const results = useClubQuery(queryString);

  const options = useMemo(
    () => results.map((club) => new ClubOption(club as ClubProfile)),
    [results]
  );

  const onSelectOption = useCallback(
    (selectedOption: ClubOption, nodeToReplace: TextNode | null, closeMenu: () => void) => {
      editor.update(() => {
        const mentionNode = $createMentionNode(selectedOption.club.handle);
        if (nodeToReplace) {
          nodeToReplace.replace(mentionNode);
        }
        mentionNode.select();
        closeMenu();
      });
    },
    [editor]
  );

  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch('@', {
    minLength: 1,
  });

  return (
    <LexicalTypeaheadMenuPlugin
      onQueryChange={(matchingString) => setQueryString(matchingString ?? '')}
      onSelectOption={onSelectOption}
      triggerFn={checkForTriggerMatch}
      options={options}
      menuRenderFn={(anchorElementRef, { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }) => {
        if (results.length === 0) {
          return null;
        }

        return (
          <div
            className={cn(
              'z-10 block w-52 rounded-xl border bg-white p-0 shadow-sm dark:border-gray-700 dark:bg-gray-900'
            )}
          >
            <div className="divide-y dark:divide-gray-700">
              {options.map((option, i) => (
                <ClubMenuItem
                  key={option.key}
                  club={option.club}
                  index={i}
                  isSelected={selectedIndex === i}
                  onClick={() => {
                    setHighlightedIndex(i);
                    selectOptionAndCleanUp(option);
                  }}
                />
              ))}
            </div>
          </div>
        );
      }}
    />
  );
};

export default ClubPickerPlugin;