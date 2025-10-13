"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Button, 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Progress,
  Switch,
  Checkbox,
  Separator,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui'
import { 
  Settings, 
  User, 
  Bell, 
  Search, 
  Plus,
  ChevronDown,
  Mail,
  Phone,
  MapPin
} from 'lucide-react'

/**
 * ShadcnExample Component
 * 
 * This component demonstrates the integration of shadcn/ui components
 * with the Yavi Studio platform's design system and animation patterns.
 * 
 * Features demonstrated:
 * - All major shadcn/ui components
 * - Framer Motion animations
 * - Design system integration
 * - Responsive layout
 * - Interactive states
 */
export function ShadcnExample() {
  const [isSwitchOn, setIsSwitchOn] = useState(false)
  const [isChecked, setIsChecked] = useState(false)
  const [progress, setProgress] = useState(33)
  const [searchValue, setSearchValue] = useState('')
  const [selectedValue, setSelectedValue] = useState('')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Shadcn/UI Components Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive showcase of shadcn/ui components integrated with Yavi Studio platform
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column - Forms & Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            
            {/* Form Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  User Profile Form
                </CardTitle>
                <CardDescription>
                  Example form using shadcn/ui form components
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      placeholder="John" 
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      placeholder="Doe" 
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="john@example.com"
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={selectedValue} onValueChange={setSelectedValue}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="guest">Guest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea 
                    id="bio" 
                    placeholder="Tell us about yourself..."
                    className="min-h-[100px] transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <Separator />

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="notifications" 
                      checked={isSwitchOn}
                      onCheckedChange={setIsSwitchOn}
                    />
                    <Label htmlFor="notifications">Enable notifications</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="terms" 
                      checked={isChecked}
                       onCheckedChange={(checked) => setIsChecked(checked === true)}
                    />
                    <Label htmlFor="terms">Accept terms</Label>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Cancel</Button>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Save Changes
                </Button>
              </CardFooter>
            </Card>

            {/* Interactive Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Interactive Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Progress: {progress}%</Label>
                  <Progress value={progress} className="h-2" />
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => setProgress(Math.max(0, progress - 10))}
                    >
                      -10
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => setProgress(Math.min(100, progress + 10))}
                    >
                      +10
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      id="search"
                      placeholder="Search components..."
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column - Display Components */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            
            {/* User Profile Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src="https://github.com/shadcn.png" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>John Doe</CardTitle>
                      <CardDescription>Software Engineer</CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">john.doe@example.com</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">San Francisco, CA</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Mail className="mr-2 h-4 w-4" />
                  Message
                </Button>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Follow
                </Button>
              </CardFooter>
            </Card>

            {/* Badges & Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status & Badges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                    <Badge variant="outline">Outline</Badge>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Project Status</span>
                      <Badge variant="secondary">In Progress</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Last Login</span>
                      <Badge>Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Notifications</span>
                      <Badge variant={isSwitchOn ? "default" : "outline"}>
                        {isSwitchOn ? "On" : "Off"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs Example */}
            <Card>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Overview Tab</h3>
                    <p className="text-gray-600">This is the overview content area.</p>
                  </div>
                </TabsContent>
                <TabsContent value="settings" className="space-y-4">
                  <div className="text-center py-8">
                    <Settings className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Settings Tab</h3>
                    <p className="text-gray-600">Configure your preferences here.</p>
                  </div>
                </TabsContent>
                <TabsContent value="activity" className="space-y-4">
                  <div className="text-center py-8">
                    <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Activity Tab</h3>
                    <p className="text-gray-600">View your recent activity.</p>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </motion.div>
        </div>

        {/* Dialog Example */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center"
        >
          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Open Dialog Example
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Shadcn/UI Dialog</DialogTitle>
                <DialogDescription>
                  This is an example of a shadcn/ui dialog component with custom styling.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    defaultValue="Pedro Duarte"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="username" className="text-right">
                    Username
                  </Label>
                  <Input
                    id="username"
                    defaultValue="@peduarte"
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </motion.div>
      </div>
    </div>
  )
}

export default ShadcnExample
