export const renderToStream = async () => {
  const { Readable } = await import('stream')
  const buffer = Buffer.from('PDF MOCK DATA')
  const stream = new Readable()
  stream.push(buffer)
  stream.push(null)
  return stream
}

export const renderToBuffer = async () => Buffer.from('PDF MOCK DATA')

export const Document = () => null
export const Page = () => null
export const Text = () => null
export const View = () => null
export const StyleSheet = {
  create: (styles: any) => styles
}
export const Font = {
  register: () => {}
}
