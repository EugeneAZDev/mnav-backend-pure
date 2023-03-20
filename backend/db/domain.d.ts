// CREATED MANUALLY

type ItemPriority = 'low' | 'medium' | 'high'

interface User {
  login: string
  password: string
  id?: string
}

interface Item {
  title: string
  description: string
  target_value: string
  priority: ItemPriority
  userId: string
  created_at: Date
  updated_at?: Date
  deleted_at?: Date
  id?: string
}

interface ItemValue {
  item_id: string
  user_id: string
  value: string
  created_at: Date
  updated_at?: Date
  deleted_at?: Date
  id?: string
}
