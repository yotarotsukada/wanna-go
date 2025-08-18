import type { Route } from "./+types/home";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button, Card, CardBody, CardHeader, Input, Chip } from "@heroui/react";
import { MapPin, Users, Link as LinkIcon, Check, Sparkles, Rocket } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "wanna-go - 行きたい場所を家族・恋人と共有しよう" },
    { name: "description", content: "アカウント不要でURLで簡単共有。地図で場所を確認できる行きたい場所管理アプリ" },
  ];
}

export default function Home() {
  const [groupId, setGroupId] = useState("");
  const navigate = useNavigate();

  const handleJoinGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (groupId.trim()) {
      navigate(`/group/${groupId.trim()}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="mb-6">
              <h1 className="text-6xl font-bold text-slate-900 dark:text-slate-50 mb-4 tracking-tight">
                wanna-go
              </h1>
              <div className="text-4xl mb-6">🗺️</div>
            </div>
            
            <div className="mb-12 space-y-2">
              <h2 className="text-3xl font-medium text-slate-500 dark:text-slate-400">
                行きたい場所を
              </h2>
              <h2 className="text-3xl font-medium text-slate-900 dark:text-slate-50">
                家族・恋人と共有しよう
              </h2>
              <p className="text-lg text-slate-500 dark:text-slate-400 mt-6 max-w-2xl mx-auto leading-relaxed">
                アカウント不要でURLを共有するだけ。お気に入りの場所をみんなで集めて、次の冒険を計画しよう
              </p>
            </div>

            {/* Primary CTA */}
            <div className="mb-12">
              <Button
                as={Link}
                to="/create"
                color="primary"
                size="lg"
                className="shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 text-lg px-8 py-3"
                startContent={<Sparkles size={20} />}
              >
                新しいグループを作成
              </Button>
            </div>
          </div>

          {/* Cards Section */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Join group card */}
            <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div>
                  <h3 className="text-xl font-semibold">既存グループに参加</h3>
                  <p className="text-small text-default-500">
                    グループIDを入力してメンバーに加わりましょう
                  </p>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <form onSubmit={handleJoinGroup} className="space-y-4">
                  <Input
                    type="text"
                    value={groupId}
                    onChange={(e) => setGroupId(e.target.value)}
                    placeholder="例: xy7k9m2p"
                    maxLength={8}
                    variant="bordered"
                    classNames={{
                      input: "text-small",
                      inputWrapper: "h-10"
                    }}
                  />
                  <Button
                    type="submit"
                    color="secondary"
                    variant="flat"
                    className="w-full"
                    startContent={<Rocket size={16} />}
                  >
                    参加する
                  </Button>
                </form>
              </CardBody>
            </Card>

            {/* Features card */}
            <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div>
                  <h3 className="text-xl font-semibold">主な機能</h3>
                  <p className="text-small text-default-500">
                    シンプルで使いやすい設計
                  </p>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <Chip
                      size="sm"
                      color="success"
                      variant="flat"
                      className="w-8 h-8 min-w-8 p-0 flex items-center justify-center"
                    >
                      <Check size={14} />
                    </Chip>
                    <span>アカウント不要</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Chip
                      size="sm"
                      color="primary"
                      variant="flat"
                      className="w-8 h-8 min-w-8 p-0 flex items-center justify-center"
                    >
                      <LinkIcon size={14} />
                    </Chip>
                    <span>URLで簡単共有</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Chip
                      size="sm"
                      color="secondary"
                      variant="flat"
                      className="w-8 h-8 min-w-8 p-0 flex items-center justify-center"
                    >
                      <MapPin size={14} />
                    </Chip>
                    <span>地図で場所を確認</span>
                  </li>
                </ul>
              </CardBody>
            </Card>
          </div>

          {/* How it works */}
          <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <CardHeader className="pb-3 text-center">
              <div className="w-full">
                <h3 className="text-xl font-semibold">使い方はとても簡単</h3>
                <p className="text-small text-default-500">3ステップで始められます</p>
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <Chip
                    size="lg"
                    color="default"
                    variant="flat"
                    className="w-12 h-12 mx-auto mb-4 text-2xl"
                  >
                    1
                  </Chip>
                  <h4 className="font-semibold mb-2">グループ作成</h4>
                  <p className="text-sm text-default-500">
                    グループ名を入力して新しいリストを作成
                  </p>
                </div>
                <div className="text-center">
                  <Chip
                    size="lg"
                    color="default"
                    variant="flat"
                    className="w-12 h-12 mx-auto mb-4 text-2xl"
                  >
                    2
                  </Chip>
                  <h4 className="font-semibold mb-2">場所を追加</h4>
                  <p className="text-sm text-default-500">
                    行きたい場所のURLを貼り付けて保存
                  </p>
                </div>
                <div className="text-center">
                  <Chip
                    size="lg"
                    color="default"
                    variant="flat"
                    className="w-12 h-12 mx-auto mb-4 text-2xl"
                  >
                    3
                  </Chip>
                  <h4 className="font-semibold mb-2">みんなで共有</h4>
                  <p className="text-sm text-default-500">
                    グループURLを家族・友人に送信
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
    </div>
  );
}
