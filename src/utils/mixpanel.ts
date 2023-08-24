// import Mixpanel from 'mixpanel'
// const mixpanel = Mixpanel.init(process.env.MIXPANEL_TOKEN ?? '')

const mixpanel = {
  track: (...args: any[]) => null
}

export default mixpanel