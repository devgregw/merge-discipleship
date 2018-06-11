export default class Utils {
    static get id() {
        return Math.random().toString(36).substr(2, 10).toUpperCase()
    }

    static get adminToolbarItem() {
        return {
            text: 'Admin Control Panel',
            handler: () => window.location.assign('/admin')
        }
    }

    static get signOutToolbarItem() {
        return {
            text: 'Sign Out',
            handler: () => window.location.replace('/')
        }
    }

    static homeToolbarItem(uid) {
        return {
            text: 'Home',
            handler: () => window.location.assign(`/${uid}`)
        }
    }

    static backToSetItem(uid, sid) {
        return {
            text: 'View all Assignments',
            handler: () => window.location.assign(`/${uid}/${sid}`)
        }
    }
}