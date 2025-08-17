import { useState } from "react";
import { Button, Card, CardBody, Popover, PopoverTrigger, PopoverContent } from "@heroui/react";

interface EmojiPickerProps {
  value?: string;
  onChange: (emoji: string) => void;
  placeholder?: string;
}

const EMOJI_CATEGORIES = {
  "活動・場所": ["🎆", "🎈", "🎪", "🎨", "🎭", "🎬", "🎤", "🎵", "🎸", "🎺", "🎯", "🎳", "🎮", "🚗", "✈️", "🏖️", "🏔️", "🌸", "🌺", "🌻"],
  "食べ物": ["🍽️", "🍕", "🍔", "🍟", "🌭", "🥪", "🌮", "🌯", "🥗", "🍝", "🍜", "🍲", "🥘", "🍣", "🍱", "🍙", "🍘", "🎂", "🍰", "🧁"],
  "場所・建物": ["🏠", "🏢", "🏣", "🏤", "🏥", "🏦", "🏨", "🏩", "🏪", "🏫", "🏬", "🏭", "🏯", "🏰", "🗼", "🗽", "⛪", "🕌", "🛕", "🕍"],
  "交通・移動": ["🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐", "🛻", "🚚", "🚛", "🚜", "🏍️", "🛵", "🚲", "🛴", "✈️", "🚁"],
  "自然・天気": ["🌞", "🌝", "🌛", "🌜", "🌚", "🌕", "🌖", "🌗", "🌘", "🌑", "🌒", "🌓", "🌔", "🌙", "⭐", "🌟", "💫", "⭐", "☀️", "🌤️"],
  "感情・ハート": ["❤️", "💛", "💙", "💚", "💜", "🧡", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "♥️"],
  "記号・その他": ["⭐", "✨", "💎", "🔥", "💧", "⚡", "🎯", "🎪", "🎨", "🎭", "🎪", "🌈", "🎁", "🎉", "🎊", "🏆", "🥇", "🥈", "🥉", "🏅"]
};

export function EmojiPicker({ value, onChange, placeholder = "絵文字を選択" }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(Object.keys(EMOJI_CATEGORIES)[0]);

  const handleEmojiSelect = (emoji: string) => {
    onChange(emoji);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange("");
    setIsOpen(false);
  };

  return (
    <Popover isOpen={isOpen} onOpenChange={setIsOpen} placement="bottom-start">
      <PopoverTrigger>
        <Button
          variant="bordered"
          className="w-full justify-start h-14 text-left"
          endContent={<span className="text-default-400">▼</span>}
        >
          <div className="flex items-center gap-2">
            {value ? (
              <span className="text-2xl">{value}</span>
            ) : (
              <span className="text-default-400">{placeholder}</span>
            )}
          </div>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0">
        <Card className="shadow-none border-0">
          <CardBody className="p-4">
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-1 mb-3">
              {Object.keys(EMOJI_CATEGORIES).map((category) => (
                <Button
                  key={category}
                  size="sm"
                  variant={selectedCategory === category ? "solid" : "ghost"}
                  color={selectedCategory === category ? "primary" : "default"}
                  className="text-xs h-8"
                  onPress={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Emoji Grid */}
            <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto pr-2">
              {EMOJI_CATEGORIES[selectedCategory as keyof typeof EMOJI_CATEGORIES].map((emoji) => (
                <Button
                  key={emoji}
                  variant="light"
                  className="h-9 w-9 min-w-0 p-0 text-lg hover:bg-default-100"
                  onPress={() => handleEmojiSelect(emoji)}
                >
                  {emoji}
                </Button>
              ))}
            </div>

            {/* Clear Button */}
            <div className="flex gap-2 mt-3 pt-3 border-t border-default-200">
              <Button
                size="sm"
                variant="light"
                className="flex-1"
                onPress={handleClear}
              >
                クリア
              </Button>
              <Button
                size="sm"
                variant="light"
                className="flex-1"
                onPress={() => setIsOpen(false)}
              >
                閉じる
              </Button>
            </div>
          </CardBody>
        </Card>
      </PopoverContent>
    </Popover>
  );
}